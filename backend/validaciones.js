import { param, body, validationResult } from "express-validator";
import { db } from "./db.js";

export const validarId = param("id").isInt({ min: 1 });

export const verificarValidaciones = (req, res, next) => {
  const validacion = validationResult(req);
  if (!validacion.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Falla de validacion",
      errors: validacion.array(),
    });
  }
  next();
};

export const validarAlumnos = [
  body("nombre")
    .isAlpha("es-ES")
    .withMessage("El nombre debe ser alfabético y no puede contener espacios.")
    .trim()
    .notEmpty()
    .withMessage("El nombre es obligatorio.")
    .isLength({ max: 45 })
    .withMessage("El nombre no puede tener más de 45 caracteres."),

  body("apellido")
    .isAlpha("es-ES")
    .withMessage(
      "El apellido debe ser alfabético y no puede contener espacios."
    )
    .trim()
    .notEmpty()
    .withMessage("El apellido es obligatorio.")
    .isLength({ max: 45 })
    .withMessage("El apellido no puede tener más de 45 caracteres."),

  body("dni")
    .isInt({ min: 1000000, max: 99999999 })
    .withMessage("El DNI debe ser un número válido y hasta 8 dígitos.")
    .custom(async (dni) => {
      const [rows] = await db.execute("SELECT id FROM alumnos WHERE dni = ?", [
        dni,
      ]);
      if (rows.length > 0) {
        throw new Error("Dni ya registrado");
      }
      return true;
    }),
];

export const validarDocentes = [

  
  body("nombre")
    .trim()
    .notEmpty()
    .withMessage("El nombre es obligatorio.")
    .isAlpha("es-ES", { ignore: " " })
    .withMessage("El nombre solo puede contener letras.")
    .isLength({ max: 45 })
    .withMessage("El nombre no puede superar los 45 caracteres."),


  body("apellido")
    .trim()
    .notEmpty()
    .withMessage("El apellido es obligatorio.")
    .isAlpha("es-ES", { ignore: " " })
    .withMessage("El apellido solo puede contener letras.")
    .isLength({ max: 45 })
    .withMessage("El apellido no puede superar los 45 caracteres."),

  
  body("dni")
    .trim()
    .notEmpty()
    .withMessage("El DNI es obligatorio.")
    .isNumeric()
    .withMessage("El DNI debe ser numérico.")
    .isLength({ max: 10 })
    .withMessage("El DNI no puede superar los 10 caracteres.")
    .custom(async (value) => {
      const [rows] = await db.execute(
        "SELECT id FROM docentes WHERE dni = ?",
        [value]
      );
      if (rows.length > 0) {
        throw new Error("El DNI ya está registrado");
      }
      return true;
    }),

  
  body("id_materia")
    .notEmpty()
    .withMessage("La materia es obligatoria.")
    .isInt({ min: 1 })
    .withMessage("La materia debe ser un número válido."),

  
  body("telefono")
    .trim()
    .notEmpty()
    .withMessage("El teléfono es obligatorio.")
    .isLength({ max: 20 })
    .withMessage("El teléfono no puede superar los 20 caracteres.")
    .matches(/^[0-9+\- ]+$/)
    .withMessage("El teléfono solo puede contener números, + o -"),


  body("mail")
    .trim()
    .notEmpty()
    .withMessage("El email es obligatorio.")
    .isEmail()
    .withMessage("Debe ser un email válido.")
    .isLength({ max: 45 })
    .withMessage("El email no puede superar los 45 caracteres.")
    .normalizeEmail()
    .custom(async (value) => {
      const [rows] = await db.execute(
        "SELECT id FROM docentes WHERE mail = ?",
        [value]
      );
      if (rows.length > 0) {
        throw new Error("El email ya está registrado");
      }
      return true;
    }),


  body("domicilio")
    .trim()
    .notEmpty()
    .withMessage("El domicilio es obligatorio.")
    .isLength({ max: 100 })
    .withMessage("El domicilio no puede superar los 100 caracteres."),


  body("sueldo")
    .notEmpty()
    .withMessage("El sueldo es obligatorio.")
    .isDecimal({ decimal_digits: "1,2" })
    .withMessage("El sueldo debe ser un número decimal válido.")
    .custom((value) => {
      if (parseFloat(value) <= 0) {
        throw new Error("El sueldo debe ser mayor a 0");
      }
      return true;
    }),
];

export const validarMaterias = [
  body("materia")
    .isAlpha("es-ES")
    .withMessage("La materia debe ser alfabética y sin espacios.")
    .trim()
    .notEmpty()
    .withMessage("La materia es obligatoria.")
    .isLength({ max: 45 })
    .withMessage("La materia no puede tener más de 45 caracteres.")
    .custom(async (materia) => {
      const [rows] = await db.execute(
        "SELECT id FROM materias WHERE materia = ?",
        [materia]
      );
      if (rows.length > 0) {
        throw new Error("Materia ya registrada");
      }
      return true;
    }),

  body("codigo")
    .isAlpha("es-ES")
    .withMessage("El código debe ser alfabético y sin espacios.")
    .trim()
    .notEmpty()
    .withMessage("El código es obligatorio.")
    .isLength({ min: 3, max: 3 })
    .withMessage("El código debe tener 3 caracteres.")
    .custom(async (codigo) => {
      const [rows] = await db.execute(
        "SELECT id FROM materias WHERE codigo = ?",
        [codigo]
      );
      if (rows.length > 0) {
        throw new Error("Código ya registrado.");
      }
      return true;
    }),

  body("año")
    .isInt({ min: 1900, max: 2150 })
    .withMessage("El año debe ser un número válido."),
];

export const validarNotas = [
  body("alumno_id")
    .isInt({ min: 1 })
    .withMessage("El ID del alumno debe ser un número entero positivo."),

  body("materia_id")
    .isInt({ min: 1 })
    .withMessage("El ID de la materia debe ser un número entero positivo.")
    .custom(async (materia_id, { req }) => {
      const { alumno_id } = req.body;

      const [rows] = await db.execute(
        "SELECT * FROM notas WHERE alumno_id = ? AND materia_id = ?",
        [alumno_id, materia_id]
      );

      if (rows.length > 0) {
        throw new Error(
          "Ya existen notas registradas para este alumno en esta materia."
        );
      }

      return true;
    }),

  body("nota1")
    .isFloat({ min: 0, max: 10 })
    .withMessage("La nota 1 debe ser un número entre 0 y 10."),

  body("nota2")
    .isFloat({ min: 0, max: 10 })
    .withMessage("La nota 2 debe ser un número entre 0 y 10."),

  body("nota3")
    .isFloat({ min: 0, max: 10 })
    .withMessage("La nota 3 debe ser un número entre 0 y 10."),
];

export const validarUsuarios = [
  body("nombre")
    .trim()
    .notEmpty()
    .withMessage("El nombre es obligatorio.")
    .isAlpha("es-ES", { ignore: " " })
    .withMessage("El nombre solo puede contener letras.")
    .isLength({ max: 45 })
    .withMessage("El nombre no puede tener más de 45 caracteres."),

  body("apellido")
    .trim()
    .notEmpty()
    .withMessage("El apellido es obligatorio.")
    .isAlpha("es-ES", { ignore: " " })
    .withMessage("El apellido solo puede contener letras.")
    .isLength({ max: 45 })
    .withMessage("El apellido no puede tener más de 45 caracteres."),

  body("username")
    .trim()
    .notEmpty()
    .withMessage("El nombre de usuario es obligatorio.")
    .isAlphanumeric("es-ES")
    .withMessage("El nombre de usuario debe ser alfanumérico y sin espacios.")
    .isLength({ max: 45 })
    .withMessage("El nombre de usuario no puede tener más de 45 caracteres.")
    .custom(async (value) => {
      const [rows] = await db.execute(
        "SELECT id FROM usuarios WHERE username = ?",
        [value]
      );
      if (rows.length > 0) {
        throw new Error("El usuario ya está registrado");
      }
      return true;
    }),

  body("password")
    .notEmpty()
    .withMessage("La contraseña es obligatoria.")
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
    .withMessage(
      "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo."
    ),
];

export const validarModificarUsuarios = [
  body("username")
    .isAlpha("es-ES")
    .withMessage("El nombre de usuario debe ser una cadena de texto.")
    .trim()
    .notEmpty()
    .withMessage("El nombre de usuario es obligatorio.")
    .isLength({ max: 45 })
    .withMessage("El nombre de usuario no puede tener más de 45 caracteres.")
    .custom(async (value, { req }) => {
      const { id } = req.params;
      const [rows] = await db.execute(
        "SELECT id FROM usuarios WHERE username = ? AND id != ?",
        [value, id]
      );
      if (rows.length > 0) {
        throw new Error("Usuario ya está registrado");
      }
      return true;
    }),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("El correo electrónico es obligatorio.")
    .isEmail()
    .withMessage("Debe proporcionar un formato de email válido.")
    .normalizeEmail()
    .custom(async (value, { req }) => {
      const { id } = req.params;
      const [rows] = await db.execute(
        "SELECT id FROM usuarios WHERE email = ? AND id != ?",
        [value, id]
      );
      if (rows.length > 0) {
        throw new Error("Correo electrónico ya está registrado");
      }
      return true;
    }),
];

export const validarLogin = [
  body("username").notEmpty().withMessage("El username es obligatorio."),
  body("contraseña").notEmpty().withMessage("La contraseña es obligatoria."),
];

export const validarModificarAlumnos = [
  body("nombre")
    .isAlpha("es-ES")
    .withMessage("El nombre debe ser alfabético.")
    .trim()
    .notEmpty()
    .withMessage("El nombre es obligatorio.")
    .isLength({ max: 45 })
    .withMessage("El nombre no puede tener más de 45 caracteres."),

  body("apellido")
    .isAlpha("es-ES")
    .withMessage("El apellido debe ser alfabético.")
    .trim()
    .notEmpty()
    .withMessage("El apellido es obligatorio.")
    .isLength({ max: 45 })
    .withMessage("El apellido no puede tener más de 45 caracteres."),

  body("dni")
    .isInt({ min: 1, max: 99999999 })
    .withMessage("El DNI debe ser un número válido de hasta 8 dígitos.")
    .custom(async (dni, { req }) => {
      const { id } = req.params;
      const [rows] = await db.execute(
        "SELECT id FROM alumnos WHERE dni = ? AND id != ?",
        [dni, id]
      );
      if (rows.length > 0) {
        throw new Error("Dni ya registrado");
      }
      return true;
    }),
];

export const validarModificarMaterias = [
  body("materia")
    .isAlpha("es-ES")
    .withMessage("La materia debe ser alfabético.")
    .trim()
    .notEmpty()
    .withMessage("La materia es obligatorio.")
    .isLength({ max: 45 })
    .withMessage("La materia no puede tener más de 45 caracteres.")
    .custom(async (materia, { req }) => {
      const { id } = req.params;
      const [rows] = await db.execute(
        "SELECT id FROM materias WHERE materia = ? AND id != ?",
        [materia, id]
      );
      if (rows.length > 0) {
        throw new Error("Materia ya registrada");
      }
      return true;
    }),

  body("codigo")
    .isAlpha("es-ES")
    .withMessage("El código debe ser una cadena de texto.")
    .trim()
    .notEmpty()
    .withMessage("El código es obligatorio.")
    .isLength({ max: 3 })
    .withMessage("El código no puede tener más de 3 caracteres.")
    .custom(async (codigo, { req }) => {
      const { id } = req.params;
      const [rows] = await db.execute(
        "SELECT id FROM materias WHERE codigo = ? AND id != ?",
        [codigo, id]
      );
      if (rows.length > 0) {
        throw new Error("Código ya registrado");
      }
      return true;
    }),

  body("año")
    .isInt({ min: 1900, max: 2150 })
    .withMessage("El año debe ser un número válido."),
];

export const validarModificarNotas = [
  body("nota1")
    .isFloat({ min: 0, max: 10 })
    .withMessage("La nota 1 debe ser un número entre 0 y 10."),

  body("nota2")
    .isFloat({ min: 0, max: 10 })
    .withMessage("La nota 2 debe ser un número entre 0 y 10."),

  body("nota3")
    .isFloat({ min: 0, max: 10 })
    .withMessage("La nota 3 debe ser un número entre 0 y 10."),
];