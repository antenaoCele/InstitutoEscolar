exports.up = function(knex) {
  return knex.schema.createTable('schedule_students', table => {
    table.integer('schedule_id').unsigned().notNullable();
    table.integer('student_id').unsigned().notNullable();

    table.primary(['schedule_id', 'student_id']);

    table
      .foreign('schedule_id')
      .references('id')
      .inTable('schedules')
      .onDelete('CASCADE');

    table
      .foreign('student_id')
      .references('id')
      .inTable('students')
      .onDelete('CASCADE');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('schedule_students');
};
