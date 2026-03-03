import { db } from "../db.js";

export const createCrudController = (table, options = {}) => {
  const { orderBy = "id", select = "*" } = options;

  return {
    getAll: async (req, res) => {
      try {
        const [rows] = await db.execute(
          `SELECT ${select} FROM ${table} ORDER BY ${orderBy} ASC`,
        );

        res.json({ success: true, data: rows });
      } catch {
        res.status(500).json({
          success: false,
          message: "Error al obtener los registros",
        });
      }
    },

    getById: async (req, res) => {
      try {
        const id = Number(req.params.id);

        if (!id || Number.isNaN(id)) {
          return res.status(400).json({
            success: false,
            message: "ID inválido",
          });
        }

        const [rows] = await db.execute(
          `SELECT ${select} FROM ${table} WHERE id = ?`,
          [id],
        );

        if (!rows.length) {
          return res.status(404).json({
            success: false,
            message: "Registro no encontrado",
          });
        }

        res.json({ success: true, data: rows[0] });
      } catch {
        res.status(500).json({
          success: false,
          message: "Error al obtener el registro",
        });
      }
    },

    create: async (req, res) => {
      try {
        const fields = Object.keys(req.body);

        if (!fields.length) {
          return res.status(400).json({
            success: false,
            message: "No se enviaron datos",
          });
        }

        const values = Object.values(req.body);
        const placeholders = fields.map(() => "?").join(", ");

        const [result] = await db.execute(
          `INSERT INTO ${table} (${fields.join(", ")})
       VALUES (${placeholders})`,
          values,
        );

        const [rows] = await db.execute(
          `SELECT ${select} FROM ${table} WHERE id = ?`,
          [result.insertId],
        );

        res.status(201).json({
          success: true,
          data: rows[0],
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Error al crear el registro",
        });
      }
    },

    update: async (req, res) => {
      try {
        const id = Number(req.params.id);

        if (!id || Number.isNaN(id)) {
          return res.status(400).json({
            success: false,
            message: "ID inválido",
          });
        }

        const fields = req.body;

        if (!Object.keys(fields).length) {
          return res.status(400).json({
            success: false,
            message: "No hay campos para actualizar",
          });
        }

        const columns = Object.keys(fields)
          .map((key) => `${key} = ?`)
          .join(", ");

        const values = Object.values(fields);

        const [result] = await db.execute(
          `UPDATE ${table} SET ${columns} WHERE id = ?`,
          [...values, id],
        );

        if (!result.affectedRows) {
          return res.status(404).json({
            success: false,
            message: "Registro no encontrado",
          });
        }

        const [rows] = await db.execute(
          `SELECT ${select} FROM ${table} WHERE id = ?`,
          [id],
        );

        res.json({
          success: true,
          data: rows[0],
        });
      } catch {
        res.status(500).json({
          success: false,
          message: "Error al actualizar",
        });
      }
    },

    delete: async (req, res) => {
      try {
        const id = Number(req.params.id);

        if (!id || Number.isNaN(id)) {
          return res.status(400).json({
            success: false,
            message: "ID inválido",
          });
        }

        const [result] = await db.execute(`DELETE FROM ${table} WHERE id = ?`, [
          id,
        ]);

        if (!result.affectedRows) {
          return res.status(404).json({
            success: false,
            message: "Registro no encontrado",
          });
        }

        res.json({
          success: true,
          message: "Registro eliminado correctamente",
        });
      } catch (error) {
        if (error.code === "ER_ROW_IS_REFERENCED_2") {
          return res.status(400).json({
            success: false,
            message:
              "No se puede eliminar porque está asociado a otros registros",
          });
        }

        res.status(500).json({
          success: false,
          message: "Error al eliminar el registro",
        });
      }
    },
  };
};
