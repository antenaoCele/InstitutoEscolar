/**
 * Convierte el array de errores que devuelve express-validator
 * (formato: [{ path, msg }, ...]) en un objeto { campo: mensaje },
 * para poder mostrarlo junto a cada Input/Select del formulario.
 */
export const mapErrors = (errors) => {
  const formatted = {};

  errors.forEach((e) => {
    formatted[e.path] = e.msg;
  });

  return formatted;
};

/**
 * Devuelve true si el objeto de errores tiene al menos una clave.
 */
export const hasErrors = (errors) => Object.keys(errors || {}).length > 0;
