exports.up = async function(knex) {
  await knex.raw(`ALTER TABLE schedule_students DROP FOREIGN KEY schedule_students_schedule_id_foreign`);
  await knex.raw(`ALTER TABLE schedule_students DROP FOREIGN KEY schedule_students_student_id_foreign`);

  await knex.raw(`ALTER TABLE schedule_students DROP PRIMARY KEY`);

  await knex.schema.alterTable('schedule_students', table => {
    table.increments('id').primary();
  });

  await knex.schema.alterTable('schedule_students', table => {
    table.unique(['schedule_id', 'student_id']);
  });

  await knex.raw(`
    ALTER TABLE schedule_students
    ADD CONSTRAINT schedule_students_schedule_id_foreign
    FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE CASCADE
  `);

  await knex.raw(`
    ALTER TABLE schedule_students
    ADD CONSTRAINT schedule_students_student_id_foreign
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
  `);
};

exports.down = async function(knex) {
  await knex.raw(`ALTER TABLE schedule_students DROP FOREIGN KEY schedule_students_schedule_id_foreign`);
  await knex.raw(`ALTER TABLE schedule_students DROP FOREIGN KEY schedule_students_student_id_foreign`);

  await knex.schema.alterTable('schedule_students', table => {
    table.dropUnique(['schedule_id', 'student_id']);
    table.dropColumn('id');
  });

  await knex.raw(`ALTER TABLE schedule_students ADD PRIMARY KEY (schedule_id, student_id)`);

  await knex.raw(`
    ALTER TABLE schedule_students
    ADD CONSTRAINT schedule_students_schedule_id_foreign
    FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE CASCADE
  `);

  await knex.raw(`
    ALTER TABLE schedule_students
    ADD CONSTRAINT schedule_students_student_id_foreign
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
  `);
};
