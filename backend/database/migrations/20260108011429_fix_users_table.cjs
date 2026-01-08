exports.up = function(knex) {
  return knex.schema
    .dropTableIfExists('users')
    .then(() => {
      return knex.schema.createTable('users', table => {
        table.increments('id').primary();

        table.string('first_name', 45).notNullable();
        table.string('last_name', 45).notNullable();
        table.string('username', 20).notNullable().unique();
        table.string('password', 100).notNullable();

        table.timestamps(true, true);
      });
    });
};

exports.down = function(knex) {
  return knex.schema.dropTable('users');
};
