exports.up = async function (knex) {
  await knex.schema.createTable("teacher_liquidations", (table) => {
    table.increments("id").primary();

    table
      .integer("teacher_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("teachers")
      .onDelete("CASCADE");

    table.string("month").notNullable(); // ej: "2026-02"

    table.decimal("total_collected", 10, 2).notNullable();
    table.decimal("net_salary", 10, 2).notNullable();

    table.timestamp("created_at").defaultTo(knex.fn.now());

    table.unique(["teacher_id", "month"]);
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTable("teacher_liquidations");
};
