import express from "express";
import { db } from "./db.js";
import { validateTutors } from "./validations.js";
import { validateID, checkValidations } from "./helpers.js";
import { authentication, authorization } from "./auth.js";

const router = express.Router();

router.get("/", authentication, async (req, res) => {
  try {
    const [tutors] = await db.execute("SELECT * FROM tutors");
    res.json({ success: true, tutors });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener los tutores",
    });
  }
});

router.get(
  "/:id",
  authentication,
  validateID,
  checkValidations,
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      const [rows] = await db.execute("SELECT * FROM tutors WHERE id=?", [id]);

      if (rows.length === 0) {
        return res
          .status(404)
          .json({ success: false, error: "Tutor no encontrado" });
      }

      res.json({ success: true, data: rows[0] });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener el tutor",
      });
    }
  },
);

router.post(
  "/",
  authentication,
  authorization("ADMIN"),
  validateTutors,
  checkValidations,
  async (req, res) => {
    try {
      const { first_name, last_name, phone, dni } = req.body;

      const [result] = await db.execute(
        "INSERT INTO tutors (first_name, last_name, phone, dni) VALUES (?,?,?,?)",
        [first_name, last_name, phone, dni],
      );

      res.status(201).json({
        success: true,
        data: { id: result.insertId, first_name, last_name, phone, dni },
        message: "Tutor creado exitosamente",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al crear el tutor",
      });
    }
  },
);

router.put(
  "/:id",
  authentication,
  authorization("ADMIN"),
  validateID,
  validateTutors,
  checkValidations,
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const [tutors] = await db.execute("SELECT * FROM tutors WHERE id=?", [
        id,
      ]);

      if (tutors.length === 0) {
        return res
          .status(404)
          .json({ success: false, error: "Tutor no encontrado" });
      }

      const { first_name, last_name, phone, dni } = req.body;

      const newFirstName = first_name ?? tutors[0].first_name;
      const newLastName = last_name ?? tutors[0].last_name;
      const newPhone = phone ?? tutors[0].phone;
      const newDni = dni ?? tutors[0].dni;

      await db.execute(
        "UPDATE tutors SET first_name=?, last_name=?, phone=?, dni=? WHERE id=?",
        [newFirstName, newLastName, newPhone, newDni, id],
      );

      res.json({
        success: true,
        data: {
          id,
          first_name: newFirstName,
          last_name: newLastName,
          phone: newPhone,
          dni: newDni,
        },
        message: "Tutor actualizado exitosamente",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al actualizar el tutor",
      });
    }
  },
);

router.delete(
  "/:id",
  authentication,
  authorization("ADMIN"),
  validateID,
  checkValidations,
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      const [rows] = await db.execute("SELECT * FROM tutors WHERE id=?", [id]);

      if (rows.length === 0) {
        return res
          .status(404)
          .json({ success: false, error: "Tutor no encontrado" });
      }

      await db.execute("DELETE FROM tutors WHERE id=?", [id]);

      res.json({ success: true, message: "Tutor eliminado correctamente" });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al eliminar el tutor",
      });
    }
  },
);

export default router;
