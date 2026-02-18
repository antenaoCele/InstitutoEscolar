import express from "express";
import { db } from "./db.js";
import {
  validateID,
  checkValidations,
  validateUsers,
  validateEditUsers,
} from "./validations.js";
import bcrypt from "bcrypt";
import { authentication, authorization } from "./auth.js";

const router = express.Router();

//---------------------GET---------------------
router.get("/", authentication, authorization("ADMIN"), async (req, res) => {
  const [rows] = await db.execute("SELECT * FROM users");
  if (rows.length === 0) {
    return res
      .status(404)
      .json({ success: false, error: "No hay usuarios registrados" });
  }
  res.json({
    success: true,
    users: rows.map((u) => ({ ...u, password_hash: undefined })),
  });
});

router.get(
  "/:id",
  authentication,
  authorization("ADMIN"),
  validateID,
  checkValidations,
  async (req, res) => {
    const id = Number(req.params.id);

    const [rows] = await db.execute(
      "SELECT id, first_name, last_name, role, username FROM users WHERE id=?",
      [id],
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Usuario no encontrado" });
    }

    res.json({ success: true, data: rows[0] });
  },
);

//---------------------POST---------------------
router.post("/", validateUsers, checkValidations, async (req, res) => {
  const { first_name, last_name, username, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 12);

  const [result] = await db.execute(
    "INSERT INTO users (first_name, password, last_name, username, role) VALUES (?,?,?,?,?)",
    [first_name, hashedPassword, last_name, username, role],
  );

  res.status(201).json({
    success: true,
    data: { id: result.insertId, first_name, last_name, username, role },
  });
});

//---------------------PUT---------------------
router.put(
  "/:id",
  authentication,
  authorization("ADMIN"),
  validateID,
  validateEditUsers,
  checkValidations,
  async (req, res) => {
    const { first_name, last_name, username, password, role } = req.body;
    const { id } = req.params;

    const [user] = await db.execute("SELECT * FROM users WHERE id=?", [id]);

    if (user.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Usuario no encontrado" });
    }

    const hashedPassword = password
      ? await bcrypt.hash(password, 12)
      : user.password;

    await db.execute(
      "UPDATE users SET first_name=?, password=?, last_name=?, username=?, role=? WHERE id=?",
      [first_name, hashedPassword, last_name, username, role, id],
    );

    return res.status(200).json({
      success: true,
      data: { id: Number(id), first_name, last_name, username, role },
    });
  },
);

//---------------------DELETE---------------------
router.delete(
  "/:id",
  authentication,
  validateID,
  checkValidations,
  async (req, res) => {
    const { id } = req.params;
    const [rows] = await db.execute("SELECT * FROM users WHERE id=?", [id]);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Usuario no encontrado" });
    }

    await db.execute("DELETE FROM users WHERE id=?", [id]);

    res.json({ success: true, message: "Usuario eliminado" });
  },
);

export default router;
