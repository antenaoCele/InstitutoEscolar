import express from "express";
import { db } from "./db.js";
import { validarId, verificarValidaciones, validarTutores } from "./validaciones.js";
import passport from "passport";

const router = express.Router();

router.get("/:id",
    validarId,
    verificarValidaciones,
    async (req, res) => {
        const id = Number(req.params.id);

        const [rows] = await db.execute(
            "SELECT * FROM tutores WHERE id=?",
            [id]
        );

        if (rows.length === 0) {
            return res
                .status(404)
                .json({ success: false, error: "Tutor no encontrado" });
        }

        res.json({ success: true, data: rows[0] });
    });

router.post(
    "/",
    validarTutores,
    verificarValidaciones,
    async (req, res) => {
        const { nombre, apellido, telefono, dni } = req.body;

        const [result] = await db.execute(
            "INSERT INTO tutores (nombre, apellido, telefono, dni) VALUES (?,?,?,?)",
            [nombre, apellido, telefono, dni]
        );

        res.status(201).json({
            success: true,
            data: { id: result.insertId, nombre, apellido, telefono, dni },
        });
    }
);

router.put("/:id",
    validarId,
    validarTutores,
    verificarValidaciones,
    async (req, res) => {
        const { nombre, apellido, telefono, dni } = req.body;
        const { id } = req.params;

        const [rows] = await db.execute("SELECT * FROM tutores WHERE id=?", [id]);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, error: "Tutor no encontrado" });
        }

        await db.execute(
            "UPDATE tutores SET nombre=?, apellido=?, telefono=?, dni=? WHERE id=?",
            [nombre, apellido, telefono, dni, id]
        );

        return res.status(200).json({
            success: true,
            data: { id: Number(id), nombre, apellido, telefono, dni },
        });
    });

router.delete("/:id", validarId, verificarValidaciones,
    async (req, res) => {
        const { id } = req.params;

        const [rows] = await db.execute("SELECT * FROM tutores WHERE id=?", [id]);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, error: "Tutor no encontrado" });
        }

        await db.execute("DELETE FROM tutores WHERE id=?", [id]);

        res.json({ success: true, message: "Tutor eliminado" });
    });

export default router;