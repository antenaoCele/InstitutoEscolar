exports.up = function(knex) {
  return knex.schema.createTable('teacher_subjects', table => {
    table.integer('teacher_id').unsigned().notNullable();
    table.integer('subject_id').unsigned().notNullable();

    table.primary(['teacher_id', 'subject_id']);

    table
      .foreign('teacher_id')
      .references('id')
      .inTable('teachers')
      .onDelete('CASCADE');

    table
      .foreign('subject_id')
      .references('id')
      .inTable('subjects')
      .onDelete('CASCADE');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('teacher_subjects');
};
