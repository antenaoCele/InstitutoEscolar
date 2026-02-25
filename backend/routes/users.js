import express from "express";
import { db } from "../db.js";
import { validateUsers, validateEditUsers } from "../validators/validations.js";
import { validateID, checkValidations } from "../validators/helpers.js";
import { authentication, authorization } from "./auth.js";
import bcrypt from "bcrypt";

const router = express.Router();

router.get("/", authentication, authorization("ADMIN"), async (req, res) => {
  try {
    const [users] = await db.execute(
      "SELECT id, first_name, last_name, username, role FROM users",
    );
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener los usuarios",
    });
  }
});

router.get(
  "/:id",
  authentication,
  authorization("ADMIN"),
  validateID("users"),
  checkValidations,
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      const [users] = await db.execute(
        "SELECT id, first_name, last_name, username, role FROM users WHERE id = ?",
        [id],
      );

      res.json({ success: true, data: users[0] });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener el usuario",
      });
    }
  },
);

router.post(
  "/",
  authentication,
  authorization("ADMIN"),
  validateUsers,
  checkValidations,
  async (req, res) => {
    try {
      const { first_name, last_name, username, password, role } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);

      const [result] = await db.execute(
        "INSERT INTO users (first_name, last_name, username, password, role) VALUES (?, ?, ?, ?, ?)",
        [first_name, last_name, username, hashedPassword, role],
      );

      res.status(201).json({
        success: true,
        data: { id: result.insertId, first_name, last_name, username, role },
        message: "Usuario creado exitosamente",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al crear el usuario",
      });
    }
  },
);

router.put(
  "/:id",
  authentication,
  authorization("ADMIN"),
  validateID("users"),
  validateEditUsers,
  checkValidations,
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { first_name, last_name, username, password, role } = req.body;

      const [users] = await db.execute("SELECT * FROM users WHERE id = ?", [
        id,
      ]);

      const newFirstName = first_name ?? users[0].first_name;
      const newLastName = last_name ?? users[0].last_name;
      const newUsername = username ?? users[0].username;
      const newRole = role ?? users[0].role;

      let newPassword = users[0].password;
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
);

router.delete(
  "/:id",
  authentication,
  authorization("ADMIN"),
  validateID("users"),
  checkValidations,
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      await db.execute("DELETE FROM users WHERE id = ?", [id]);

      res.json({ success: true, message: "Usuario eliminado correctamente" });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al eliminar el usuario",
      });
    }
  },
);

export default router;
