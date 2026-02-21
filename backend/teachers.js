import express from "express";
import { db } from "./db.js";
import { validateTeachers } from "./validations.js";
import { validateID, checkValidations } from "./helpers.js";
import { authentication, authorization } from "./auth.js";

const router = express.Router();

router.get("/", authentication, authorization("ADMIN"), async (req, res) => {
  try {
    const [teachers] = await db.execute("SELECT * FROM teachers");
    res.json({ success: true, teachers });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener los docentes",
    });
  }
});

router.get(
  "/:id",
  authentication,
  authorization("ADMIN"),
  validateID,
  checkValidations,
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      const [teacher] = await db.execute("SELECT * FROM teachers WHERE id=?", [
        id,
      ]);

      res.json({ success: true, data: teacher[0] });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener el docente",
      });
    }
  },
);

//VER LIQUIDACIONES DE UN DOCENTE
router.get(
  "/:id/liquidations",
  authentication,
  authorization("ADMIN"),
  validateID("teachers"),
  checkValidations,
  async (req, res) => {
    const { id } = req.params;

    try {
      const [liquidations] = await db.execute(
        "SELECT * FROM teacher_liquidations WHERE teacher_id = ? ORDER BY id DESC",
        [id],
      );

      res.json({ success: true, data: liquidations });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener liquidaciones",
      });
    }
  },
);

router.post(
  "/",
  authentication,
  authorization("ADMIN"),
  validateTeachers,
  checkValidations,
  async (req, res) => {
    try {
      const { first_name, last_name, dni, phone } = req.body;

      const [result] = await db.execute(
        "INSERT INTO teachers (first_name, last_name, dni, phone) VALUES (?,?,?,?)",
        [first_name, last_name, dni, phone],
      );

      res.status(201).json({
        success: true,
        data: { id: result.insertId, first_name, last_name, dni, phone },
        message: "Docente creado exitosamente",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al crear el docente",
      });
    }
  },
);

//ENDPOINT PARA LIQUIDAR UN MES DEL DOCENTE
router.post(
  "/:id/liquidate",
  authentication,
  authorization("ADMIN"),
  validateID("teachers"),
  checkValidations,
  async (req, res) => {
    console.log("ENTRO AL ENDPOINT NUEVO");
    const { id } = req.params;
    const { month } = req.body; // ejemplo: "2026-02"

    const [debugRows] = await db.execute(
      `
  SELECT 
    p.amount,
    p.payment_date,
    sp.teacher_id
  FROM payments p
  JOIN student_plans sp ON sp.id = p.student_plan_id
  WHERE sp.teacher_id = ?
  `,
      [id],
    );

    console.log("DEBUG ROWS:", debugRows);

    try {
      // Calcular total recaudado del docente en ese mes
      const [rows] = await db.execute(
        `
        SELECT SUM(p.amount) AS total
        FROM payments p
        JOIN student_plans sp ON sp.id = p.student_plan_id
        WHERE sp.teacher_id = ?
        AND p.payment_date >= ?
        AND p.payment_date < DATE_ADD(?, INTERVAL 1 MONTH)
        `,
        [id, `${month}-01`, `${month}-01`],
      );
      console.log("ROWS RESULT:", rows);
      const totalCollected = Number(rows[0].total) || 0;
      const netSalary = Number(totalCollected) * 0.75;

      console.log("TOTAL COLLECTED:", totalCollected);
      console.log("NET SALARY:", netSalary);

      // Insertar liquidación
      await db.execute(
        `
        INSERT INTO teacher_liquidations 
        (teacher_id, month, total_collected, net_salary)
        VALUES (?, ?, ?, ?)
        `,
        [id, month, totalCollected, netSalary],
      );

      res.status(201).json({
        success: true,
        data: {
          teacher_id: id,
          month,
          total_collected: totalCollected,
          net_salary: netSalary,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al liquidar sueldo",
      });
    }
  },
);

router.put(
  "/:id",
  authentication,
  authorization("ADMIN"),
  validateID("teachers"),
  validateTeachers,
  checkValidations,
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { first_name, last_name, dni, phone } = req.body;

      const [teachers] = await db.execute("SELECT * FROM teachers WHERE id=?", [
        id,
      ]);

      const newFirstName = first_name ?? teachers[0].first_name;
      const newLastName = last_name ?? teachers[0].last_name;
      const newDni = dni ?? teachers[0].dni;
      const newPhone = phone ?? teachers[0].phone;

      await db.execute(
        "UPDATE teachers SET first_name=?, last_name=?, dni=?,phone=? WHERE id=?",
        [newFirstName, newLastName, newDni, newPhone, id],
      );

      return res.status(200).json({
        success: true,
        data: {
          id,
          first_name: newFirstName,
          last_name: newLastName,
          dni: newDni,
          phone: newPhone,
        },
        message: "Docente actualizado exitosamente",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al actualizar el docente",
      });
    }
  },
);

router.delete(
  "/:id",
  authentication,
  authorization("ADMIN"),
  validateID("teachers"),
  checkValidations,
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      await db.execute("DELETE FROM teachers WHERE id=?", [id]);

      res.json({ success: true, message: "Docente eliminado correctamente" });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al eliminar el docente",
      });
    }
  },
);

export default router;
