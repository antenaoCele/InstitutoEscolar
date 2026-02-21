exports.up = function(knex) {
  return knex.schema.createTable('student_plans', table => {
    table.increments('id').primary();

    table.integer('student_id').unsigned().notNullable();
    table.integer('plan_id').unsigned().notNullable();

    table.decimal('paid_amount', 10, 2).notNullable();
    table.date('start_date').notNullable();

    table
      .foreign('student_id')
      .references('id')
      .inTable('students')
      .onDelete('CASCADE');

    table
      .foreign('plan_id')
      .references('id')
      .inTable('plans')
      .onDelete('CASCADE');

    table.unique(['student_id', 'plan_id']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('student_plans');
};
