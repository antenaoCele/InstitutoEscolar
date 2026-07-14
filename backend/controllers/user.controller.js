import { db } from "../db.js";
import bcrypt from "bcrypt";

export const getMe = async (req, res) => {
  try {
    const userId = req.user.userId;

    const [rows] = await db.execute(
      "SELECT id, username, first_name, last_name, role FROM users WHERE id = ?",
      [userId],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    res.json({
      success: true,
      user: rows[0],
    });
  } catch (error) {
    console.error("Error en /me:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
};

export const updateMe = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { first_name, last_name, username } = req.body;

    const fields = { first_name, last_name, username };
    const updates = Object.entries(fields).filter(([, v]) => v !== undefined);

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No se enviaron campos para actualizar",
      });
    }

    const setClause = updates.map(([key]) => `${key} = ?`).join(", ");
    const values = updates.map(([, value]) => value);

    await db.execute(`UPDATE users SET ${setClause} WHERE id = ?`, [
      ...values,
      userId,
    ]);

    const [rows] = await db.execute(
      "SELECT id, username, first_name, last_name, role FROM users WHERE id = ?",
      [userId],
    );

    res.json({
      success: true,
      user: rows[0],
      message: "Perfil actualizado con éxito",
    });
  } catch (error) {
    console.error("Error en updateMe:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    const [users] = await db.execute("SELECT * FROM users WHERE id = ?", [
      userId,
    ]);

    const user = users[0];

    const passwordMatch = await bcrypt.compare(currentPassword, user.password);

    if (!passwordMatch) {
      return res.status(400).json({
        success: false,
        message: "La contraseña actual es incorrecta",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.execute("UPDATE users SET password = ? WHERE id = ?", [
      hashedPassword,
      userId,
    ]);

    res.json({
      success: true,
      message: "Contraseña actualizada con éxito",
    });
  } catch (error) {
    console.error("Error en changePassword:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
};
