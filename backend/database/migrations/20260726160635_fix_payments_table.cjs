// migrations/xxxx_add_period_and_type_to_payments.js
exports.up = async function (knex) {
  await knex.schema.alterTable("payments", (table) => {
    table.string("payment_period", 7).notNullable(); // formato YYYY-MM
    table
      .enu("payment_type", ["NORMAL", "REGULARIZATION"])
      .notNullable()
      .defaultTo("NORMAL");
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable("payments", (table) => {
    table.dropColumn("payment_period");
    table.dropColumn("payment_type");
  });
};
