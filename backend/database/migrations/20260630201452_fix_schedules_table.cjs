exports.up = async function (knex) {
  const hasColumn = await knex.schema.hasColumn("schedules", "plan_id");

  if (!hasColumn) {
    await knex.schema.alterTable("schedules", (table) => {
      table.integer("plan_id").unsigned().nullable().after("teacher_id");

      table
        .foreign("plan_id")
        .references("id")
        .inTable("plans")
        .onDelete("SET NULL")
        .onUpdate("CASCADE");
    });
  }
};

exports.down = async function (knex) {
  const hasColumn = await knex.schema.hasColumn("schedules", "plan_id");

  if (hasColumn) {
    await knex.schema.alterTable("schedules", (table) => {
      table.dropForeign("plan_id");
      table.dropColumn("plan_id");
    });
  }
};