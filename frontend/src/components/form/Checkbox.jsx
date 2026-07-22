import clsx from "clsx";

export default function Checkbox({
  label,
  checked,
  id,
  onChange,
  className = "",
  disabled = false,
}) {
  return (
    <label
      className={clsx(
        "flex items-center gap-3 cursor-pointer text-gray-800 dark:text-gray-200",
        {
          "cursor-not-allowed opacity-50": disabled,
        },
      )}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className={clsx(
          "w-4 h-4 rounded border-gray-300 focus:ring-2 focus:ring-brand-500",
          className,
        )}
      />

      {label && <span className="text-sm font-medium">{label}</span>}
    </label>
  );
}
