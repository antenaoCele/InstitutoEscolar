exports.up = async function (knex) {
  const hasTable = await knex.schema.hasTable("student_plans");

  if (hasTable) {
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
