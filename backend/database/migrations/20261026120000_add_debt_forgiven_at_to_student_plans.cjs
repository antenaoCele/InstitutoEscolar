exports.up = async (knex) => {
  await knex.schema.alterTable("student_plans", (table) => {
    table.dateTime("debt_forgiven_at").nullable().after("end_date");
  });
};

exports.down = async (knex) => {
  await knex.schema.alterTable("student_plans", (table) => {
    table.dropColumn("debt_forgiven_at");
  });
};
