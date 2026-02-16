import express from "express";
import { db } from "./db.js";
import { checkValidations, validateLogin } from "./validations.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import passport from "passport";
import { Strategy, ExtractJwt } from "passport-jwt";


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

export const authentication = passport.authenticate("jwt", {
  session: false,
});

export const authorization = (role) => {
   return (req, res, next) => {
    const userRole = req.user.role;

    if (!userRole || userRole.toUpperCase() !== role.toUpperCase()) {
      return res.status(403).json({
        success: false,
        message: "Usuario no autorizado",
      });
    }

    next();
  };
};

router.post(
  "/login",
  validateLogin,
  checkValidations,
  async (req, res) => {
    const { username, password} = req.body;

    const [users] = await db.execute(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );

    if (users.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "Usuario o contraseña no valido" });
    }

    const hashedPassword = users[0].password;
    const comparedPassword = await bcrypt.compare(password, hashedPassword);

    if (!comparedPassword) {
      return res
        .status(400)
        .json({ success: false, error: "Usuario o contraseña no valido" });
    }


    const payload = { 
      userId: users[0].id,
      role: users[0].role
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "4h",
    });

    res.json({
      success: true,
      token,
      nombre: users[0].first_name,
      message: "Inicio de sesion exitoso",
    });
  }
);

export default router;