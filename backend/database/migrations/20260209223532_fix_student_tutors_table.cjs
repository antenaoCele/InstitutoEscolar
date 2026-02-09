exports.up = async function(knex) {
  await knex.raw(`ALTER TABLE student_tutors DROP FOREIGN KEY student_tutors_student_id_foreign`);
  await knex.raw(`ALTER TABLE student_tutors DROP FOREIGN KEY student_tutors_tutor_id_foreign`);

  await knex.raw(`ALTER TABLE student_tutors DROP PRIMARY KEY`);

  await knex.schema.alterTable('student_tutors', table => {
    table.increments('id').primary();
  });

  await knex.schema.alterTable('student_tutors', table => {
    table.unique(['student_id', 'tutor_id']);
  });

  await knex.raw(`
    ALTER TABLE student_tutors
    ADD CONSTRAINT student_tutors_student_id_foreign
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
  `);

  await knex.raw(`
    ALTER TABLE student_tutors
    ADD CONSTRAINT student_tutors_tutor_id_foreign
    FOREIGN KEY (tutor_id) REFERENCES tutors(id) ON DELETE CASCADE
  `);
};

exports.down = async function(knex) {
  await knex.raw(`ALTER TABLE student_tutors DROP FOREIGN KEY student_tutors_student_id_foreign`);
  await knex.raw(`ALTER TABLE student_tutors DROP FOREIGN KEY student_tutors_tutor_id_foreign`);

  await knex.schema.alterTable('student_tutors', table => {
    table.dropUnique(['student_id', 'tutor_id']);
    table.dropColumn('id');
  });

  await knex.raw(`ALTER TABLE student_tutors ADD PRIMARY KEY (student_id, tutor_id)`);

  await knex.raw(`
    ALTER TABLE student_tutors
    ADD CONSTRAINT student_tutors_student_id_foreign
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
  `);

  await knex.raw(`
    ALTER TABLE student_tutors
    ADD CONSTRAINT student_tutors_tutor_id_foreign
    FOREIGN KEY (tutor_id) REFERENCES tutors(id) ON DELETE CASCADE
  `);
};
