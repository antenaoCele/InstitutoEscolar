import { db } from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const [users] = await db.execute("SELECT * FROM users WHERE username = ?", [
      username,
    ]);

    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Usuario o contraseña no valido",
      });
    }

    const user = users[0];

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(400).json({
        success: false,
        error: "Usuario o contraseña no valido",
      });
    }

    const payload = {
      userId: user.id,
      role: user.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "4h",
    });

    res.json({
      success: true,
      token,
      nombre: user.first_name,
      message: "Inicio de sesión exitoso",
    });
  } catch (error) {
    console.error("Error en login:", error);

    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
};
