
exports.up = function(knex) {
  return knex.schema.createTable('users', function(table) {
     table.increments('id').primary(); // int AI PK

    table.string('first_name', 45).notNullable();
    table.string('last_name', 45).notNullable();
    table.string('dni', 10).notNullable().unique();

    table.string('school', 45);

    table.date('birth_date').notNullable();

    table.integer('plan_id').unsigned().notNullable();

    table.boolean('enrollment').notNullable(); // tinyint

    table.string('level', 45);
    table.integer('grade');

    // recommended
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  
};
