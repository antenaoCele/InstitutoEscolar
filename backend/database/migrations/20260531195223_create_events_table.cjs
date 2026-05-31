exports.up = function (knex) {
  return knex.schema.createTable("events", (table) => {
    table.increments("id").primary();
    table.string("name").notNullable();
    table.date("date").notNullable();
    table.time("hour").notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("events");
};
