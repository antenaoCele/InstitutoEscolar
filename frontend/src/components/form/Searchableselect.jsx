import { useEffect, useMemo, useRef, useState, Children } from "react";

// ======================================================
// Extrae el texto de un <option>, sea string, número o un
// array de fragmentos (ej: {apellido}, {nombre}).
// ======================================================
function getNodeText(node) {
  if (node === null || node === undefined || typeof node === "boolean")
    return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(getNodeText).join("");
  if (node.props?.children) return getNodeText(node.props.children);
  return "";
}

// Saca acentos y pasa a minúscula para que "Rodriguez" encuentre
// "Rodríguez" y viceversa.
function normalize(text) {
  return String(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export default function SearchableSelect({
  label,
  name,
  value,
  onChange,
  error,
  disabled = false,
  className = "",
  children,
  noMargin = false,
  searchPlaceholder = "Buscar...",
  emptyMessage = "Sin resultados",
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlighted, setHighlighted] = useState(0);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // ======================================================
  // Convierte los <option> hijos en datos manejables.
  // El option de value="" se usa como placeholder del botón,
  // no como una fila más de la lista.
  // ======================================================
  const { options, placeholder } = useMemo(() => {
    const parsed = [];
    let ph = "Seleccione una opción";

    Children.toArray(children).forEach((child) => {
      if (!child?.props) return;

      const optValue = child.props.value ?? "";
      const optLabel = getNodeText(child.props.children).trim();

      if (String(optValue) === "") {
        if (optLabel) ph = optLabel;
        return;
      }

      parsed.push({
        value: optValue,
        label: optLabel,
        disabled: !!child.props.disabled,
      });
    });

    return { options: parsed, placeholder: ph };
  }, [children]);

  const selected = options.find((o) => String(o.value) === String(value ?? ""));

  const filtered = useMemo(() => {
    if (!search.trim()) return options;

    const term = normalize(search);
    return options.filter((o) => normalize(o.label).includes(term));
  }, [options, search]);

  // ======================================================
  // Cerrar al hacer click afuera
  // ======================================================
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // Foco automático en el buscador al abrir
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // El resaltado vuelve al principio cada vez que cambia el filtro
  useEffect(() => {
    setHighlighted(0);
  }, [search, open]);

  // Mantiene visible la opción resaltada al navegar con flechas
  useEffect(() => {
    if (!open || !listRef.current) return;

    const node = listRef.current.children[highlighted];
    node?.scrollIntoView({ block: "nearest" });
  }, [highlighted, open]);

  // ======================================================
  // Selección
  // Se emite un evento con la misma forma que el <select>
  // nativo para no romper los onChange existentes.
  // ======================================================
  const selectOption = (option) => {
    if (option.disabled) return;

    onChange?.({ target: { name, value: option.value } });

    setOpen(false);
    setSearch("");
  };

  const toggleOpen = () => {
    if (disabled) return;
    setOpen((prev) => !prev);
    setSearch("");
  };

  const handleKeyDown = (e) => {
    if (disabled) return;

    if (!open) {
      if (["Enter", " ", "ArrowDown"].includes(e.key)) {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((prev) => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[highlighted]) selectOption(filtered[highlighted]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      setSearch("");
    } else if (e.key === "Tab") {
      setOpen(false);
      setSearch("");
    }
  };

  return (
    <div className={noMargin ? "" : "mb-4"}>
      {label && (
        <label className="mb-1 block text-black dark:text-white">{label}</label>
      )}

      <div ref={containerRef} className="relative">
        {/* ---------- Disparador (imita al <select>) ---------- */}
        <button
          type="button"
          name={name}
          disabled={disabled}
          onClick={toggleOpen}
          onKeyDown={handleKeyDown}
          aria-haspopup="listbox"
          aria-expanded={open}
          className={`
            w-full
            rounded-lg
            border-2

            h-11 px-3

            flex items-center justify-between gap-2
            text-left

            bg-white
            text-black

            border-gray-300

            focus:border-[#0cc0df]
            focus:ring-2
            focus:ring-[#0cc0df]/30
            focus:outline-none

            dark:bg-black
            dark:text-white
            dark:border-gray-600

            disabled:bg-gray-100
            disabled:text-gray-400
            disabled:cursor-not-allowed
            dark:disabled:bg-gray-900
            dark:disabled:text-gray-500

            ${open ? "border-[#0cc0df] ring-2 ring-[#0cc0df]/30" : ""}
            ${error ? "border-red-500" : ""}

            ${className}
          `}
        >
          <span
            className={`truncate ${
              selected ? "" : "text-gray-400 dark:text-gray-500"
            }`}
          >
            {selected ? selected.label : placeholder}
          </span>

          <svg
            className={`h-4 w-4 shrink-0 transition-transform ${
              open ? "rotate-180" : ""
            }`}
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path
              d="M6 8l4 4 4-4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* ---------- Panel desplegable ---------- */}
        {open && (
          <div
            className="
              absolute z-50 mt-1 w-full
              rounded-lg border-2 border-gray-300
              bg-white shadow-lg
              dark:border-gray-600 dark:bg-black
            "
          >
            <div className="p-2">
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={searchPlaceholder}
                className="
                  w-full
                  rounded-lg border-2 border-gray-300
                  h-9 px-3
                  bg-white text-black
                  focus:border-[#0cc0df]
                  focus:ring-2 focus:ring-[#0cc0df]/30
                  focus:outline-none
                  dark:bg-black dark:text-white dark:border-gray-600
                "
              />
            </div>

            <ul
              ref={listRef}
              role="listbox"
              className="max-h-60 overflow-y-auto pb-1"
            >
              {filtered.length === 0 && (
                <li className="px-3 py-2 text-sm text-gray-400 dark:text-gray-500">
                  {emptyMessage}
                </li>
              )}

              {filtered.map((option, index) => {
                const isSelected = String(option.value) === String(value ?? "");
                const isHighlighted = index === highlighted;

                return (
                  <li
                    key={option.value}
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setHighlighted(index)}
                    onClick={() => selectOption(option)}
                    className={`
                      cursor-pointer px-3 py-2
                      text-black dark:text-white
                      ${isHighlighted ? "bg-[#0cc0df]/15" : ""}
                      ${isSelected ? "font-medium text-[#0cc0df]" : ""}
                      ${
                        option.disabled
                          ? "cursor-not-allowed text-gray-400 dark:text-gray-600"
                          : ""
                      }
                    `}
                  >
                    {option.label}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
