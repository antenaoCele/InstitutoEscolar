exports.up = async (knex) => {
  await knex.schema.alterTable("schedule_students", (table) => {
    table
      .integer("plan_id")
      .unsigned()
      .notNullable()
      .after("student_id")
      .references("id")
      .inTable("plans");
  });

  await knex.schema.alterTable("schedules", (table) => {
    table.dropForeign("plan_id");
    table.dropColumn("plan_id");
  });
};

exports.down = async (knex) => {
  await knex.schema.alterTable("schedules", (table) => {
    table
      .integer("plan_id")
      .unsigned()
      .nullable()
      .after("teacher_id")
      .references("id")
      .inTable("plans");
  });

  await knex.schema.alterTable("schedule_students", (table) => {
    table.dropForeign("plan_id");
    table.dropColumn("plan_id");
  });
};
