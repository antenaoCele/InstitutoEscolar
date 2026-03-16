exports.up = async function (knex) {
  await knex.schema.alterTable("payments", (table) => {
    table.decimal("plan_price", 10, 2).notNullable();
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable("student_plans", (table) => {
    table.dropColumn("plan_price");
  });
};
