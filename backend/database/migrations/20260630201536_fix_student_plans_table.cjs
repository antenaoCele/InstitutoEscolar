exports.up = async function (knex) {
  const hasTable = await knex.schema.hasTable("student_plans");

  if (hasTable) {
    // La FK de student_id debe conservar un índice al eliminar el compuesto.
    const [indexes] = await knex.raw(
      `SELECT INDEX_NAME FROM information_schema.STATISTICS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'student_plans'
         AND INDEX_NAME = 'student_plans_student_id_index'`,
    );
    if (!indexes.length) {
      await knex.schema.alterTable("student_plans", (table) => {
        table.index("student_id", "student_plans_student_id_index");
      });
    }

    await knex.schema.alterTable("student_plans", (table) => {
      table.dropUnique(
        ["student_id", "plan_id"],
        "student_plans_student_id_plan_id_unique",
      );
    });
  }
};

exports.down = async function (knex) {
  const hasTable = await knex.schema.hasTable("student_plans");

  if (hasTable) {
    await knex.schema.alterTable("student_plans", (table) => {
      table.unique(
        ["student_id", "plan_id"],
        "student_plans_student_id_plan_id_unique",
      );
    });
  }
};
