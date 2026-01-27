//id, name, duration, price

import express from "express";
import { db } from "./db.js";
import { validateID, checkValidations, validatePlans } from "./validations.js";
import { authentication } from "./auth.js";

const router = express.Router();

//GET 
router.get(
    "/",
    authentication,
    async (req, res) => {

        const [plans] = await db.execute("SELECT * FROM plans");
        res.json({success: true, plans})
    });


router.get("/:id",
    authentication,
    validateID,
    checkValidations,
    async (req, res) => {
        const id = Number(req.params.id);

        const [exists] = await db.execute("SELECT * FROM plans WHERE id=?", [id]);

        if (exists.length === 0) {
            return res.status(404).json({ success: false, error: "Plan no encontrado" });
        }


        const [rows] = await db.execute(
            "SELECT id, name, duration, price FROM plans WHERE id=?",
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
    authentication,
    validatePlans,
    checkValidations,
    async (req, res) => {
        const { name, duration, price} = req.body;


        const [result] = await db.execute(
            "INSERT INTO plans (name, duration, price) VALUES (?,?,?)",
            [name, duration, price]
        );

        res.status(201).json({
            success: true,
            data: { id: result.insertId, name, duration, price },
        });
    }
);

router.put("/:id",
    authentication,
    validateID,
    validatePlans,
    checkValidations,
    async (req, res) => {
        const { name, duration, price } = req.body;
        const { id } = req.params;

        const [rows] = await db.execute("SELECT * FROM plans WHERE id=?", [id]);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, error: "Plan no encontrado" });
        }


        await db.execute(
            "UPDATE plans SET name=?, duration=?, price=? WHERE id=?",
            [name, duration, price, id]
        );

        return res.status(200).json({
            success: true,
            data: { id: Number(id), name, duration, price },
        });

    });


router.delete("/:id", 
    authentication,
    validateID, 
    checkValidations,
    async (req, res) => {
        const { id } = req.params;

        const [rows] = await db.execute("SELECT * FROM plans WHERE id=?", [id]);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, error: "Plan no encontrado" });
        }

        await db.execute("DELETE FROM plans WHERE id=?", [id]);

        res.json({ success: true, message: "Plan eliminado con éxito" });
    });


export default router;
