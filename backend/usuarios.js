import express from "express";
import { db } from "./db.js";
import { validarId, verificarValidaciones, validarUsuarios } from "./validaciones.js";
import bcrypt from "bcrypt";
import passport from "passport";

const router = express.Router();

router.get(
    "/",
    passport.authenticate("jwt", { session: false }),
    async (req, res) => {

        const [rows] = await db.execute("SELECT * FROM usuarios");
        res.json({
            success: true,
            usuarios: rows.map((u) => ({ ...u, password_hash: undefined })),
        });
    }
);

router.get("/:id",
    validarId,
    verificarValidaciones,
    passport.authenticate("jwt", { session: false }),
    async (req, res) => {
        const id = Number(req.params.id);

        const [existe] = await db.execute("SELECT * FROM usuarios WHERE id=?", [id]);

        if (existe.length === 0) {
            return res.status(404).json({ success: false, error: "Usuario no encontrado" });
        }


        const [rows] = await db.execute(
            "SELECT id, nombre, apellido, username FROM usuarios WHERE id=?",
            [id]
        );

        if (rows.length === 0) {
            return res
                .status(404)
                .json({ success: false, error: "Usuario no encontrado" });
        }

        res.json({ success: true, data: rows[0] });
    });

router.post(
    "/",
    validarUsuarios,
    verificarValidaciones,
    async (req, res) => {
        const { nombre, apellido, username, password } = req.body;

        const hashedPassword = await bcrypt.hash(password, 12);

        const [result] = await db.execute(
            "INSERT INTO usuarios (nombre, password, apellido, username) VALUES (?,?,?,?)",
            [nombre, hashedPassword, apellido, username]
        );

        res.status(201).json({
            success: true,
            data: { id: result.insertId, nombre, apellido, username },
        });
    }
);

router.put("/:id",
    validarId,
    validarUsuarios,
    verificarValidaciones,
    passport.authenticate("jwt", { session: false }),
    async (req, res) => {
        const { nombre, apellido, username, password } = req.body;
        const { id } = req.params;

        const [rows] = await db.execute("SELECT * FROM usuarios WHERE id=?", [id]);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, error: "Usuario no encontrado" });
        }

        const hashedPassword = password ? await bcrypt.hash(password, 12) : usuario.password_hash;

        await db.execute(
            "UPDATE usuarios SET nombre=?, password=?, apellido=?, username=? WHERE id=?",
            [nombre, hashedPassword, apellido, username, id]
        );

        return res.status(200).json({
            success: true,
            data: { id: Number(id), nombre, apellido, username },
        });

    });


router.delete("/:id", validarId, verificarValidaciones,
    passport.authenticate("jwt", { session: false }),
    async (req, res) => {
        const { id } = req.params;

        const [rows] = await db.execute("SELECT * FROM usuarios WHERE id=?", [id]);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, error: "Usuario no encontrado" });
        }

        await db.execute("DELETE FROM usuarios WHERE id=?", [id]);

        res.json({ success: true, message: "Usuario eliminado" });
    });


export default router;
