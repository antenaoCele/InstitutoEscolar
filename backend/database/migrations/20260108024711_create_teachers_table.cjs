exports.up = function(knex) {
  return knex.schema.createTable('teachers', table => {
    table.increments('id').primary();

    table.string('first_name', 45).notNullable();
    table.string('last_name', 45).notNullable();

    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('teachers');
};
