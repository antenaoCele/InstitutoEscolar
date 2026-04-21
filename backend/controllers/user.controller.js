import { db } from "../db.js";

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
