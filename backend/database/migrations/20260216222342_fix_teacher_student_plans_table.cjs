exports.up = async function (knex) {
  await knex.schema.table("student_plans", (table) => {
    table.dropColumn("paid_amount");
  });
};

exports.down = async function (knex) {
  await knex.schema.table("student_plans", (table) => {
    table.decimal("paid_amount");
  });
};
