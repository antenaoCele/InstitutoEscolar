import { param, body, validationResult } from "express-validator";
import { db } from "./db.js";

export const validateID = param("id").isInt({ min: 1 });

export const checkValidations
 = (req, res, next) => {
  const validation = validationResult(req);
  if (!validation.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Falla de validacion",
      errors: validation.array(),
    });
  }
  next();
};

//-----------------------------------------------------------------------

//-----------------------VALIDACIÓN PARA ALUMNOS-------------------------

export const validateStudents = [
  body("first_name")
    .isAlpha("es-ES")
    .withMessage("El nombre debe ser alfabético y no puede contener espacios.")
    .trim()
    .notEmpty()
    .withMessage("El nombre es obligatorio.")
    .isLength({ max: 45 })
    .withMessage("El nombre no puede tener más de 45 caracteres."),

  body("last_name")
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
      const [rows] = await db.execute("SELECT id FROM students WHERE dni = ?", [
        dni,
      ]);
      if (rows.length > 0) {
        throw new Error("Dni ya registrado");
      }
      return true;
    }),

    body("school")
    .isAlpha("es-ES", { ignore: ' ' } )
    .withMessage(
      "El colegio debe ser alfabético."
    )
    .trim()
    .notEmpty()
    .withMessage("El colegio es obligatorio.")
    .isLength({ max: 45 })
    .withMessage("El colegio no puede tener más de 45 caracteres."),

    body("birth_date")
    .isDate()
    .withMessage("La fecha de nacimiento debe ser una fecha válida."),

    body("enrolled")
    .isBoolean()
    .toBoolean()
    .withMessage("La inscripción debe ser un valor booleano."),

  body("level")
  .isString()
  .trim()
  .toLowerCase()
  .isIn(['inicial', 'primario', 'secundario', 'universitario'])
  .withMessage('El nivel debe ser inicial, primario, secundario o universitario.'),

  body("grade")
   .isInt()        
    .toInt()      
    .isIn([1,2,3,4,5,6,7]) 
    .withMessage('La categoría debe ser del 1 al 7')
];

//-----------------------------------------------------------------------

//-----------------------VALIDACIÓN PARA DOCENTES------------------------

export const validateTeachers = [

  body("first_name")
    .trim()
    .notEmpty()
    .withMessage("El nombre es obligatorio.")
    .isAlpha("es-ES", { ignore: " " })
    .withMessage("El nombre solo puede contener letras.")
    .isLength({ max: 45 })
    .withMessage("El nombre no puede superar los 45 caracteres."),

  body("last_name")
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
        "SELECT id FROM teachers WHERE dni = ?",
        [value]
      );
      if (rows.length > 0) {
        throw new Error("El DNI ya está registrado");
      }
      return true;
    }),

  body("phone")
    .trim()
    .notEmpty()
    .withMessage("El teléfono es obligatorio.")
    .isLength({ max: 20 })
    .withMessage("El teléfono no puede superar los 20 caracteres.")
    .matches(/^[0-9+\- ]+$/)
    .withMessage("El teléfono solo puede contener números, + o -"),

  body("salary")
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

//-----------------------------------------------------------------------

//-----------------------VALIDACIÓN PARA TUTORES-------------------------

export const validateTutors = [

  body("first_name")
    .trim()
    .notEmpty()
    .withMessage("El nombre es obligatorio.")
    .isAlpha("es-ES", { ignore: " " })
    .withMessage("El nombre solo puede contener letras.")
    .isLength({ max: 45 })
    .withMessage("El nombre no puede superar los 45 caracteres."),

  body("last_name")
    .trim()
    .notEmpty()
    .withMessage("El apellido es obligatorio.")
    .isAlpha("es-ES", { ignore: " " })
    .withMessage("El apellido solo puede contener letras.")
    .isLength({ max: 45 })
    .withMessage("El apellido no puede superar los 45 caracteres."),

  body("phone")
    .trim()
    .notEmpty()
    .withMessage("El teléfono es obligatorio.")
    .isLength({ max: 20 })
    .withMessage("El teléfono no puede superar los 20 caracteres.")
   .isNumeric()
.withMessage("El teléfono solo puede contener números."),

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
        "SELECT id FROM tutors WHERE dni = ?",
        [value]
      );
      if (rows.length > 0) {
        throw new Error("El DNI ya está registrado");
      }
      return true;
    }),
];

//-----------------------------------------------------------------------

//-----------------------VALIDACIÓN PARA HORARIOS------------------------

export const validateSchedules = [

  body("teacher_id")
    .notEmpty()
    .withMessage("El docente es obligatorio.")
    .isInt({ min: 1 })
    .withMessage("El docente debe ser un ID válido."),
  
  body("subject_id")
    .notEmpty()
    .withMessage("La materia es obligatoria.")
    .isInt({ min: 1 })
    .withMessage("La materia debe ser un ID válido."),

  body("start_time")
    .notEmpty()
    .withMessage("La hora de inicio es obligatoria.")
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage("La hora de inicio debe tener formato HH:MM."),
  
  body("end_time")
    .notEmpty()
    .withMessage("La hora de fin es obligatoria.")
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage("La hora de fin debe tener formato HH:MM.")
    .custom((value, { req }) => {
      if (req.body.hora_inicio >= value) {
        throw new Error("La hora de fin debe ser mayor a la hora de inicio.");
      }
      return true;
    }),

  body("days")
    .trim()
    .notEmpty()
    .withMessage("Los días son obligatorios.")
    .isLength({ max: 10 })
    .withMessage("Los días no pueden superar los 10 caracteres."),
];

//-----------------------------------------------------------------------

//-----------------------VALIDACIÓN PARA MATERIAS------------------------

export const validateSubjects = [

  body("name")
    .isAlpha("es-ES", { ignore: " " })
    .withMessage("La materia debe ser alfabética.")
    .trim()
    .notEmpty()
    .withMessage("La materia es obligatoria.")
    .isLength({ max: 45 })
    .withMessage("La materia no puede tener más de 45 caracteres.")
    .custom(async (name) => {
      const [rows] = await db.execute(
        "SELECT id FROM subjects WHERE name = ?",
        [name]
      );
      if (rows.length > 0) {
        throw new Error("Materia ya registrada");
      }
      return true;
    }),
    
];

//-----------------------------------------------------------------------

//-----------------------VALIDACIÓN PARA PLANES--------------------------

export const validatePlans = [

  body("name")
    .trim()
    .notEmpty()
    .withMessage("El nombre del plan es obligatorio.")
    .isLength({ max: 45 })
    .withMessage("El nombre del plan no puede superar los 45 caracteres."),

  body("price")
    .notEmpty()
    .withMessage("El monto es obligatorio.")
    .isDecimal({ decimal_digits: "1,2" })
    .withMessage("El monto debe ser un número decimal válido.")
    .custom((value) => {
      if (parseFloat(value) <= 0) {
        throw new Error("El monto debe ser mayor a 0.");
      }
      return true;
    }),

  body("duration")
    .trim()
    .notEmpty()
    .withMessage("La duración es obligatoria.")
    .isLength({ max: 50 })
    .withMessage("La duración no puede superar los 50 caracteres."),
];

//-----------------------------------------------------------------------

//-----------------------VALIDACIÓN PARA PAGOS---------------------------

export const validatePayments = [

  body("student_plan_id")
    .notEmpty()
    .withMessage("El alumno es obligatorio.")
    .isInt({ min: 1 })
    .withMessage("El alumno debe ser válido.")
    .custom(async (value) => {
      const [rows] = await db.execute(
        "SELECT id FROM alumnos WHERE id = ?",
        [value]
      );
      if (rows.length === 0) {
        throw new Error("El alumno no existe.");
      }
      return true;
    }),

  body("payment_day")
    .notEmpty()
    .withMessage("La fecha de pago es obligatoria.")
    .isISO8601()
    .withMessage("La fecha debe tener formato YYYY-MM-DD."),
  
  body("mount")
    .notEmpty()
    .withMessage("El monto es obligatorio.")
    .isDecimal({ decimal_digits: "1,2" })
    .withMessage("El monto debe ser un número decimal válido.")
    .custom((value) => {
      if (parseFloat(value) <= 0) {
        throw new Error("El monto debe ser mayor a 0.");
      }
      return true;
    }),

  body("payment_method")
    .trim()
    .notEmpty()
    .withMessage("El método de pago es obligatorio.")
    .isLength({ max: 45 })
    .withMessage("El método de pago no puede superar los 45 caracteres."),
];

//-----------------------------------------------------------------------

//-------------------VALIDACIÓN PARA ALUMNOS-TUTORES---------------------

export const validateStudentsTutors = [

  body("student_id")
    .notEmpty()
    .withMessage("El alumno es obligatorio.")
    .isInt({ min: 1 })
    .withMessage("El alumno debe ser válido.")
    .custom(async (value) => {
      const [rows] = await db.execute(
        "SELECT id FROM students WHERE id = ?",
        [value]
      );
      if (rows.length === 0) {
        throw new Error("El alumno no existe.");
      }
      return true;
    }),

  body("tutor_id")
    .notEmpty()
    .withMessage("El tutor es obligatorio.")
    .isInt({ min: 1 })
    .withMessage("El tutor debe ser válido.")
    .custom(async (value, { req }) => {
      const [rows] = await db.execute(
        "SELECT id FROM tutors WHERE id = ?",
        [value]
      );
      if (rows.length === 0) {
        throw new Error("El tutor no existe.");
      }

      const [relacion] = await db.execute(
        "SELECT id FROM student_tutors WHERE student_id = ? AND tutor_id = ?",
        [req.body.student_id, value]
      );

      if (relacion.length > 0) {
        throw new Error("El tutor ya está asignado a este alumno.");
      }

      return true;
    }),
];

//-----------------------------------------------------------------------

//-----------------------VALIDACIÓN PARA USUARIOS------------------------

export const validateUsers = [
  body("first_name")
    .trim()
    .notEmpty()
    .withMessage("El nombre es obligatorio.")
    .isAlpha("es-ES", { ignore: " " })
    .withMessage("El nombre solo puede contener letras.")
    .isLength({ max: 45 })
    .withMessage("El nombre no puede tener más de 45 caracteres."),

  body("last_name")
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
        "SELECT id FROM users WHERE username = ?",
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

//-----------------------------------------------------------------------

//-------------------VALIDACIÓN PARA EDITAR USUARIOS---------------------

export const validateEditUsers = [
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
        "SELECT id FROM users WHERE username = ? AND id != ?",
        [value, id]
      );
      if (rows.length > 0) {
        throw new Error("Usuario ya está registrado");
      }
      return true;
    }),
  
];

//-----------------------------------------------------------------------

//-----------------------VALIDACIÓN PARA LOGIN---------------------------

export const validateLogin = [
  body("username").notEmpty().withMessage("El username es obligatorio."),
  body("password").notEmpty().withMessage("La contraseña es obligatoria."),
];

//-----------------------------------------------------------------------

//------------------VALIDACIÓN PARA EDITAR ALUMNOS--------------------

export const validateEditStudents = [
  body("first_name")
    .isAlpha("es-ES")
    .withMessage("El nombre debe ser alfabético.")
    .trim()
    .notEmpty()
    .withMessage("El nombre es obligatorio.")
    .isLength({ max: 45 })
    .withMessage("El nombre no puede tener más de 45 caracteres."),

  body("last_name")
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
        "SELECT id FROM students WHERE dni = ? AND id != ?",
        [dni, id]
      );
      if (rows.length > 0) {
        throw new Error("Dni ya registrado");
      }
      return true;
    }),
];

//-----------------------------------------------------------------------

//-------------------VALIDACIÓN PARA EDITAR MATERIAS---------------------

export const validateEditSubjects = [
  body("name")
    .isAlpha("es-ES")
    .withMessage("La materia debe ser alfabético.")
    .trim()
    .notEmpty()
    .withMessage("La materia es obligatorio.")
    .isLength({ max: 45 })
    .withMessage("La materia no puede tener más de 45 caracteres.")
    .custom(async (name, { req }) => {
      const { id } = req.params;
      const [rows] = await db.execute(
        "SELECT id FROM subjects WHERE name = ? AND id != ?",
        [name, id]
      );
      if (rows.length > 0) {
        throw new Error("Materia ya registrada");
      }
      return true;
    }),

];

