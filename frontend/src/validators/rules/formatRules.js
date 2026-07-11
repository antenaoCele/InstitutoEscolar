/* =========================================================
REQUERIDO
========================================================= */
export const isRequired = (value) =>
  value === undefined || value === null || value.toString().trim() === "";

/* =========================================================
ARRAYS
========================================================= */
export const isEmptyArray = (value) =>
  !Array.isArray(value) || value.length === 0;

/* =========================================================
DNI
========================================================= */
export const isValidDNI = (value) => {
  const clean = value?.toString().replace(/\D/g, "") || "";
  return /^\d{7,8}$/.test(clean);
};

/* =========================================================
NOMBRE DE PERSONA (solo letras y espacios)
========================================================= */
export const isValidPersonName = (value) =>
  /^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]{3,45}$/.test(value?.toString().trim() || "");

/* =========================================================
NOMBRE GENÉRICO (colegio, institución, etc.)
========================================================= */
export const isValidName = (value) => {
  const text = value?.toString().trim() || "";

  const validChars = /^[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ\s°º().,+\-/#]{3,45}$/;
  const hasLettersOrNumbers = /[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ]/;

  return validChars.test(text) && hasLettersOrNumbers.test(text);
};
/* =========================================================
MONTO / DINERO (positivo)
========================================================= */
export const isPositiveNumber = (value) =>
  value !== "" && value !== null && !isNaN(value) && Number(value) > 0;

/* =========================================================
TELÉFONO
========================================================= */
export const isValidPhone = (value) => {
  const phone = value?.toString().trim() || "";

  return /^[0-9+\- ]{6,20}$/.test(phone);
};

/* =========================================================
MÉTODO DE PAGO
========================================================= */
export const isValidPaymentMethod = (value) =>
  ["efectivo", "transferencia", "qr", "otro"].includes(value);

/* =========================================================
NIVEL EDUCATIVO
========================================================= */
export const isValidLevel = (value) =>
  ["Inicial", "Primario", "Secundario", "Universitario"].includes(value);

/* =========================================================
GRADO / AÑO
========================================================= */
export const isValidGrade = (value) => {
  const grade = Number(value);
  return Number.isInteger(grade) && grade >= 1 && grade <= 7;
};

/* =========================================================
FECHA
========================================================= */
export const isValidDateFormat = (value) => !isNaN(Date.parse(value));

/* =========================================================
FECHA DE NACIMIENTO
========================================================= */
export const isValidBirthDate = (value) => {
  if (!value || isNaN(Date.parse(value))) return false;

  const birth = new Date(value);
  const today = new Date();

  // No puede ser una fecha futura
  if (birth > today) return false;

  const age = today.getFullYear() - birth.getFullYear();

  // Máximo 120 años
  return age >= 0 && age <= 120;
};
