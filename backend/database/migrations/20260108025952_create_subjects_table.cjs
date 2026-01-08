exports.up = function(knex) {
  return knex.schema.createTable('subjects', table => {
    table.increments('id').primary();

    table.string('name', 100).notNullable();

    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('subjects');
};
