exports.up = function(knex) {
  return knex.schema.createTable('payments', table => {
    table.increments('id').primary();

    table.integer('student_plan_id').unsigned().notNullable();
    table.decimal('amount', 10, 2).notNullable();
    table.date('payment_date').notNullable();
    table.string('payment_method', 45);

    table
      .foreign('student_plan_id')
      .references('id')
      .inTable('student_plans')
      .onDelete('CASCADE');

    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('payments');
};
