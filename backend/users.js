import express from "express";
import { db } from "./db.js";
import { validateID, checkValidations, validateUsers } from "./validations.js";
import bcrypt from "bcrypt";
import { authentication } from "./auth.js";

const router = express.Router();

router.get(
    "/",
    authentication,
    async (req, res) => {

        const [rows] = await db.execute("SELECT * FROM users");
        res.json({
            success: true,
            users: rows.map((u) => ({ ...u, password_hash: undefined })),
        });
    }
);

router.get("/:id",
    validateID,
    checkValidations,
    authentication,
    async (req, res) => {
        const id = Number(req.params.id);

        const [existe] = await db.execute("SELECT * FROM users WHERE id=?", [id]);

        if (existe.length === 0) {
            return res.status(404).json({ success: false, error: "Usuario no encontrado" });
        }


        const [rows] = await db.execute(
            "SELECT id, first_name, last_name, username FROM users WHERE id=?",
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
    validateUsers,
    checkValidations,
    async (req, res) => {
        const { first_name, last_name, username, password } = req.body;

        const hashedPassword = await bcrypt.hash(password, 12);

        const [result] = await db.execute(
            "INSERT INTO users (first_name, password, last_name, username) VALUES (?,?,?,?)",
            [first_name, hashedPassword, last_name, username]
        );

        res.status(201).json({
            success: true,
            data: { id: result.insertId, first_name, last_name, username },
        });
    }
);

router.put("/:id",
    authentication,
    validateID,
    validateUsers,
    checkValidations,
    async (req, res) => {
        const { first_name, last_name, username, password } = req.body;
        const { id } = req.params;

        const [rows] = await db.execute("SELECT * FROM users WHERE id=?", [id]);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, error: "Usuario no encontrado" });
        }

        //REVISAR ESTO BIEN
        const hashedPassword = password ? await bcrypt.hash(password, 12) : users.password;

        await db.execute(
            "UPDATE users SET first_name=?, password=?, last_name=?, username=? WHERE id=?",
            [first_name, hashedPassword, last_name, username, id]
        );

        return res.status(200).json({
            success: true,
            data: { id: Number(id), first_name, last_name, username },
        });

    });


router.delete("/:id", authentication, validateID, checkValidations,
    async (req, res) => {
        const { id } = req.params;

        const [rows] = await db.execute("SELECT * FROM users WHERE id=?", [id]);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, error: "Usuario no encontrado" });
        }

        await db.execute("DELETE FROM users WHERE id=?", [id]);

        res.json({ success: true, message: "Usuario eliminado" });
    });


export default router;
