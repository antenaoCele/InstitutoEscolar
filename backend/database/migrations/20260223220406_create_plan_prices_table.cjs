exports.up = async function (knex) {
  await knex.schema.createTable("plan_prices", (table) => {
    table.increments("id").primary();

    table
      .integer("plan_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("plans")
      .onDelete("CASCADE");

    table.decimal("price", 10, 2).notNullable();

    table.date("start_date").notNullable();
    table.date("end_date").nullable();

    table.timestamps(true, true);
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("plan_prices");
};
