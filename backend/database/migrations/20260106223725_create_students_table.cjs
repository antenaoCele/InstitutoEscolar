exports.up = function(knex) {
  return knex.schema.createTable('students', table => {
    table.increments('id').primary();
    table.string('first_name', 45).notNullable();
    table.string('last_name', 45).notNullable();
    table.string('dni', 10).notNullable().unique();
    table.string('school', 45);
    table.date('birth_date');
    table.boolean('enrolled').defaultTo(false);
    table.string('level', 45);
    table.integer('grade');
  });
}

exports.down = function(knex) {
  return knex.schema.dropTable('students');
}