exports.up = function(knex) {
  return knex.schema.createTable('student_tutors', table => {
    table.integer('student_id').unsigned().notNullable();
    table.integer('tutor_id').unsigned().notNullable();

    table.primary(['student_id', 'tutor_id']);

    table
      .foreign('student_id')
      .references('id')
      .inTable('students')
      .onDelete('CASCADE');

    table
      .foreign('tutor_id')
      .references('id')
      .inTable('tutors')
      .onDelete('CASCADE');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('student_tutors');
};
