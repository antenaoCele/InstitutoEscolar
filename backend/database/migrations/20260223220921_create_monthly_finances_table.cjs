exports.up = async function (knex) {
  await knex.schema.createTable("monthly_finances", (table) => {
    table.increments("id").primary();

    table.integer("year").notNullable();
    table.integer("month").notNullable();

    table.decimal("total_income", 12, 2).notNullable().defaultTo(0);
    table.decimal("total_salaries", 12, 2).notNullable().defaultTo(0);
    table.decimal("other_expenses", 12, 2).notNullable().defaultTo(0);
    table.decimal("net_profit", 12, 2).notNullable().defaultTo(0);

    table.timestamps(true, true);

    table.unique(["year", "month"]);
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("monthly_finances");
};
