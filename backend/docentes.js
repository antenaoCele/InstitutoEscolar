import express from "express";
import { db } from "./db.js";
import { validarId, verificarValidaciones, validarDocentes } from "./validaciones.js";
import passport from "passport";

const router = express.Router();

router.get("/:id",
    validarId,
    verificarValidaciones,
    async (req, res) => {
        const id = Number(req.params.id);

        const [rows] = await db.execute(
            "SELECT * FROM docentes WHERE id=?",
            [id]
        );

        if (rows.length === 0) {
            return res
                .status(404)
                .json({ success: false, error: "Docente no encontrado" });
        }

        res.json({ success: true, data: rows[0] });
    });

router.post(
    "/",
    validarDocentes,
    verificarValidaciones,
    async (req, res) => {
        const { nombre, apellido, dni, id_materia, telefono, mail, domicilio, sueldo } = req.body;

        const [result] = await db.execute(
            "INSERT INTO docentes (nombre, apellido, dni, id_materia, telefono, mail, domicilio, sueldo) VALUES (?,?,?,?,?,?,?,?)",
            [nombre, apellido, dni, id_materia, telefono, mail, domicilio, sueldo]
        );

        res.status(201).json({
            success: true,
            data: { id: result.insertId, nombre, apellido, dni, id_materia, telefono, mail, domicilio, sueldo },
        });
    }
);

router.put("/:id",
    validarId,
    validarDocentes,
    verificarValidaciones,
    async (req, res) => {
        const { nombre, apellido, dni, id_materia, telefono, mail, domicilio, sueldo } = req.body;
        const { id } = req.params;

        const [rows] = await db.execute("SELECT * FROM docentes WHERE id=?", [id]);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, error: "Docente no encontrado" });
        }

        await db.execute(
            "UPDATE docentes SET nombre=?, apellido=?, dni=?, id_materia=?, telefono=?, mail=?, domicilio=?, sueldo=? WHERE id=?",
            [nombre, apellido, dni, id_materia, telefono, mail, domicilio, sueldo, id]
        );

        return res.status(200).json({
            success: true,
            data: { id: Number(id), nombre, apellido, dni, id_materia, telefono, mail, domicilio, sueldo },
        });
    });

router.delete("/:id", validarId, verificarValidaciones,
    async (req, res) => {
        const { id } = req.params;

        const [rows] = await db.execute("SELECT * FROM docentes WHERE id=?", [id]);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, error: "Docente no encontrado" });
        }

        await db.execute("DELETE FROM docentes WHERE id=?", [id]);

        res.json({ success: true, message: "Docente eliminado" });
    });

export default router;
