exports.up = async function (knex) {
  await knex.schema.alterTable("student_plans", (table) => {
    table.date("end_date").nullable().after("start_date");
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable("student_plans", (table) => {
    table.dropColumn("end_date");
  });
};
