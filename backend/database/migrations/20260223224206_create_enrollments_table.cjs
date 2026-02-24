exports.up = async function (knex) {
  await knex.schema.createTable("enrollments", (table) => {
    table.increments("id").primary();

    table
      .integer("student_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("students")
      .onDelete("CASCADE");

    table.decimal("amount", 10, 2).notNullable();

    table.date("payment_date").notNullable();

    table.timestamps(true, true);
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("enrollments");
};
