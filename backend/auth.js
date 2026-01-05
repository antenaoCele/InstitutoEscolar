import express from "express";
import { db } from "./db.js";
import { verificarValidaciones } from "./validaciones.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import passport from "passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { body } from "express-validator";

const router = express.Router();

export function authConfig() {
  const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
  };

  passport.use(
    new Strategy(jwtOptions, async (payload, next) => {
      next(null, payload);
    })
  );
}

export const autenticacion = passport.authenticate("jwt", {
  session: false,
});

export const autorizacion = (rol) => {
  return (req, res, next) => {
    const roles = req.user.roles;
    if (!roles || !roles.includes(rol)) {
      return res
        .status(401)
        .json({ success: false, message: "Usuario no autorizado" });
    }
    next();
  };
};

router.post(
  "/login",
  [
    body("nombre").notEmpty().withMessage("El nombre es obligatorio"),
    body("contrasena").notEmpty().withMessage("La contraseña es obligatoria"),
  ],
  verificarValidaciones,
  async (req, res) => {
    const { nombre, contrasena } = req.body;

    const [usuarios] = await db.execute(
      "SELECT * FROM usuarios WHERE nombre = ?",
      [nombre]
    );

    if (usuarios.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "usuario o contraseña no valido" });
    }

    const hashedPassword = usuarios[0].contrasena;
    const passwordComparada = await bcrypt.compare(contrasena, hashedPassword);

    if (!passwordComparada) {
      return res
        .status(400)
        .json({ success: false, error: "usuario o contraseña no valido" });
    }

    const payload = { userId: usuarios[0].id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "4h",
    });

    res.json({
      success: true,
      token,
      nombre: usuarios[0].nombre,
      message: "Inicio de sesion exitoso",
    });
  }
);

export default router;