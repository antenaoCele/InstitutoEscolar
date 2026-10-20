exports.up = async function (knex) {
  const hasColumn = await knex.schema.hasColumn("schedules", "subject_id");

  if (hasColumn) {
    // MySQL exige eliminar las claves foráneas antes de quitar la columna.
    const [constraints] = await knex.raw(
      `SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'schedules'
         AND COLUMN_NAME = 'subject_id' AND REFERENCED_TABLE_NAME IS NOT NULL`,
    );
    for (const constraint of constraints) {
      await knex.schema.alterTable("schedules", (table) => {
        table.dropForeign("subject_id", constraint.CONSTRAINT_NAME);
      });
    }

    await knex.schema.alterTable("schedules", (table) => {
      table.dropColumn("subject_id");
    });
  }
};

exports.down = async function (knex) {
  const hasColumn = await knex.schema.hasColumn("schedules", "subject_id");

  if (!hasColumn) {
    await knex.schema.alterTable("schedules", (table) => {
      table.integer("subject_id").unsigned().notNullable();
    });
  }
};
