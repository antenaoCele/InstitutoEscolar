exports.up = function (knex) {
  return knex.schema.createTable('plans', function (table) {
    table.increments('id').primary();
    table.string('name', 45).notNullable();
    table.string('duration', 50);
    table.decimal('price', 10, 2).notNullable();
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('plans');
};
