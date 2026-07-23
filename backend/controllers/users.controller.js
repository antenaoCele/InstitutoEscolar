import { db } from "../db.js";
import bcrypt from "bcrypt";

export const usersController = {
  getAll: async (req, res) => {
    try {
      const { role } = req.query;

      let query = `
      SELECT
        u.id,
        u.first_name,
        u.last_name,
        u.username,
        u.role,
        t.id AS teacher_id
      FROM users u
      LEFT JOIN teachers t ON t.user_id = u.id
    `;

      const params = [];

      if (role && role !== "all") {
        query += " WHERE u.role = ?";
        params.push(role);
      }

      const [rows] = await db.execute(query, params);

      res.json({
        success: true,
        data: rows,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener los registros",
      });
    }
  },

  getById: async (req, res) => {
    try {
      const id = Number(req.params.id);

      const [rows] = await db.execute(
        `
        SELECT 
        id, 
        first_name, 
        last_name, 
        username, 
        role 
        FROM users WHERE id = ?`,
        [id],
      );

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Usuario no encontrado",
        });
      }

      res.json({
        success: true,
        data: rows[0],
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener el usuario",
      });
    }
  },

  create: async (req, res) => {
    try {
      const { first_name, last_name, username, password, role } = req.body;

      const hashedPassword = await bcrypt.hash(password, 10);

      const [result] = await db.execute(
        "INSERT INTO users (first_name, last_name, username, password, role) VALUES (?, ?, ?, ?, ?)",
        [first_name, last_name, username, hashedPassword, role],
      );

      res.status(201).json({
        success: true,
        data: {
          id: result.insertId,
          first_name,
          last_name,
          username,
          role,
        },
        message: "Usuario creado exitosamente",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al crear el usuario",
      });
    }
  },

  update: async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { first_name, last_name, username, password, role } = req.body;

      const [rows] = await db.execute("SELECT * FROM users WHERE id = ?", [id]);

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Usuario no encontrado",
        });
      }

      const currentUser = rows[0];

      const newFirstName = first_name ?? currentUser.first_name;
      const newLastName = last_name ?? currentUser.last_name;
      const newUsername = username ?? currentUser.username;
      const newRole = role ?? currentUser.role;

      let newPassword = currentUser.password;

      if (password) {
        newPassword = await bcrypt.hash(password, 10);
      }

      await db.execute(
        "UPDATE users SET first_name=?, last_name=?, username=?, password=?, role=? WHERE id=?",
        [newFirstName, newLastName, newUsername, newPassword, newRole, id],
      );

      res.json({
        success: true,
        data: {
          id,
          first_name: newFirstName,
          last_name: newLastName,
          username: newUsername,
          role: newRole,
        },
        message: "Usuario actualizado exitosamente",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al actualizar el usuario",
      });
    }
  },

  // DELETE
  delete: async (req, res) => {
    try {
      const id = Number(req.params.id);

      const [result] = await db.execute("DELETE FROM users WHERE id = ?", [id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Usuario no encontrado",
        });
      }

      res.json({
        success: true,
        message: "Usuario eliminado correctamente",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al eliminar el usuario",
      });
    }
  },
};
