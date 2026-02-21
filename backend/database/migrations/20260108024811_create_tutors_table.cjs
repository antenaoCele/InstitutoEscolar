exports.up = function(knex) {
  return knex.schema.createTable('tutors', table => {
    table.increments('id').primary();

    table.string('first_name', 45).notNullable();
    table.string('last_name', 45).notNullable();
    table.string('phone', 20);
    table.string('dni', 10);

    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('tutors');
};
