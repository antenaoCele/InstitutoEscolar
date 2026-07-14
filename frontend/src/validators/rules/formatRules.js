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
DNI - solo dígitos (sin validar largo)
Usado como primer chequeo, antes de isValidDNI, para poder
distinguir "tiene caracteres inválidos" de "largo incorrecto",
igual que hace el backend con notEmpty -> isNumeric -> isLength.
========================================================= */
export const isNumericDNI = (value) =>
  /^\d+$/.test(value?.toString().replace(/\D/g, "") || "");

/* =========================================================
DNI
Regla espejo de validateDNI (backend): numérico, 7-8 dígitos.
========================================================= */
export const isValidDNI = (value) => {
  const clean = value?.toString().replace(/\D/g, "") || "";
  return /^\d{7,8}$/.test(clean);
};

/* =========================================================
NOMBRE DE PERSONA (solo letras y espacios)
Regla espejo de validatePersonName (backend): 3-45 caracteres.
========================================================= */
export const isValidPersonName = (value) =>
  /^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]{3,45}$/.test(value?.toString().trim() || "");

/* =========================================================
NOMBRE GENÉRICO (colegio, institución, etc.)
Regla espejo de validateName (backend): 3-45 caracteres.
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
Regla espejo de validatePhone (backend): notEmpty, max 20
caracteres, charset [0-9+- ]. Sin mínimo de largo (el backend
tampoco lo exige).
========================================================= */
export const isValidPhone = (value) => {
  const phone = value?.toString().trim() || "";

  return phone.length > 0 && phone.length <= 20 && /^[0-9+\- ]+$/.test(phone);
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
USERNAME
Regla espejo de validateUsername (backend): alfanumérico, 3-45.
========================================================= */
export const isValidUsername = (value) =>
  /^[a-zA-Z0-9]{3,45}$/.test(value?.toString().trim() || "");

/* =========================================================
PASSWORD
Regla espejo de validatePassword (backend, isStrongPassword):
mín. 8 caracteres, 1 minúscula, 1 mayúscula, 1 número, 1 símbolo.
========================================================= */
export const isValidPassword = (value) => {
  const text = value?.toString() || "";

  return (
    text.length >= 8 &&
    /[a-z]/.test(text) &&
    /[A-Z]/.test(text) &&
    /[0-9]/.test(text) &&
    /[^a-zA-Z0-9]/.test(text)
  );
};

/* =========================================================
ROL
Regla espejo de validateRole (backend): ADMIN o DOCENTE.
========================================================= */
export const isValidRole = (value) => ["ADMIN", "DOCENTE"].includes(value);

/* =========================================================
FECHA
========================================================= */
export const isValidDateFormat = (value) => !isNaN(Date.parse(value));

/* =========================================================
FECHA DE NACIMIENTO
Base: validateDate (backend) exige ISO válida y no futura.
El tope de 120 años es una regla propia del front (UX),
sin equivalente explícito en el backend.
========================================================= */
export const isValidBirthDate = (value) => {
  if (!value || isNaN(Date.parse(value))) return false;

  const birth = new Date(value);
  const today = new Date();

  if (birth > today) return false;

  const age = today.getFullYear() - birth.getFullYear();

  return age >= 0 && age <= 120;
};
