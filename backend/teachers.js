import express from "express";
import { db } from "./db.js";
import { validateId, checkvalidations, validateteachers } from "./validations.js";
import passport from "passport";

const router = express.Router();

router.get("/:id",
    validateId,
    checkvalidations,
    async (req, res) => {
        const id = Number(req.params.id);

        const [rows] = await db.execute(
            "SELECT * FROM teachers WHERE id=?",
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
    validateteachers,
    checkvalidations,
    async (req, res) => {
        const { first_name, last_name, dni,phone,salary } = req.body;

        const [result] = await db.execute(
            "INSERT INTO teachers (first_name, last_name, dni,phone, salary) VALUES (?,?,?,?,?)",
            [first_name, last_name, dni,phone,salary]
        );

        res.status(201).json({
            success: true,
            data: { id: result.insertId, first_name, last_name, dni,phone,salary },
        });
    }
);

router.put("/:id",
    validateId,
    validateteachers,
    checkvalidations,
    async (req, res) => {
        const { first_name, last_name, dni,phone,salary } = req.body;
        const { id } = req.params;

        const [rows] = await db.execute("SELECT * FROM teachers WHERE id=?", [id]);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, error: "Docente no encontrado" });
        }

        await db.execute(
            "UPDATE teachers SET first_name=?, last_name=?, dni=?,phone=?,salary=? WHERE id=?",
            [first_name, last_name, dni,phone,salary, id]
        );

        return res.status(200).json({
            success: true,
            data: { id: Number(id), first_name, last_name, dni,phone, salary },
        });
    });

router.delete("/:id", validateId, checkvalidations,
    async (req, res) => {
        const { id } = req.params;

        const [rows] = await db.execute("SELECT * FROM teachers WHERE id=?", [id]);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, error: "Docente no encontrado" });
        }

        await db.execute("DELETE FROM teachers WHERE id=?", [id]);

        res.json({ success: true, message: "Docente eliminado" });
    });

export default router;
