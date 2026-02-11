import express from "express";
import { db } from "./db.js";
import { validateID, checkValidations, validateTutors } from "./validations.js";
import passport from "passport";

const router = express.Router();

router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const [tutors] = await db.execute("SELECT * FROM tutors");
    res.json({ success: true, tutors });
  },
);

router.get(
  "/:id",
  validateID,
  checkValidations,
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const id = Number(req.params.id);

    const [rows] = await db.execute("SELECT * FROM tutors WHERE id=?", [id]);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Tutor no encontrado" });
    }

    res.json({ success: true, data: rows[0] });
  },
);

router.post(
  "/",
  validateTutors,
  checkValidations,
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { first_name, last_name, phone, dni } = req.body;

    const [result] = await db.execute(
      "INSERT INTO tutors (first_name, last_name, phone, dni) VALUES (?,?,?,?)",
      [first_name, last_name, phone, dni],
    );

    res.status(201).json({
      success: true,
      data: { id: result.insertId, first_name, last_name, phone, dni },
    });
  },
);

router.put(
  "/:id",
  validateID,
  validateTutors,
  checkValidations,
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { first_name, last_name, phone, dni } = req.body;
    const { id } = req.params;

    const [rows] = await db.execute("SELECT * FROM tutors WHERE id=?", [id]);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Tutor no encontrado" });
    }

    await db.execute(
      "UPDATE tutors SETfirst_name=?, last_name=?, phone=?, dni=? WHERE id=?",
      [first_name, last_name, phone, dni, id],
    );

    return res.status(200).json({
      success: true,
      data: { id: Number(id), first_name, last_name, phone, dni },
    });
  },
);

router.delete(
  "/:id",
  validateID,
  checkValidations,
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { id } = req.params;

    const [rows] = await db.execute("SELECT * FROM tutors WHERE id=?", [id]);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Tutor no encontrado" });
    }

    await db.execute("DELETE FROM tutors WHERE id=?", [id]);

    res.json({ success: true, message: "Tutor eliminado" });
  },
);

export default router;
