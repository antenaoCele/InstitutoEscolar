exports.up = async function(knex) {
  await knex.raw(`ALTER TABLE teacher_subjects DROP FOREIGN KEY teacher_subjects_teacher_id_foreign`);
  await knex.raw(`ALTER TABLE teacher_subjects DROP FOREIGN KEY teacher_subjects_subject_id_foreign`);

  await knex.raw(`ALTER TABLE teacher_subjects DROP PRIMARY KEY`);

  await knex.schema.alterTable('teacher_subjects', table => {
    table.increments('id').primary();
  });

  await knex.schema.alterTable('teacher_subjects', table => {
    table.unique(['teacher_id', 'subject_id']);
  });

  await knex.raw(`
    ALTER TABLE teacher_subjects
    ADD CONSTRAINT teacher_subjects_teacher_id_foreign
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
  `);

  await knex.raw(`
    ALTER TABLE teacher_subjects
    ADD CONSTRAINT teacher_subjects_subject_id_foreign
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
  `);
};

exports.down = async function(knex) {
  await knex.raw(`ALTER TABLE teacher_subjects DROP FOREIGN KEY teacher_subjects_teacher_id_foreign`);
  await knex.raw(`ALTER TABLE teacher_subjects DROP FOREIGN KEY teacher_subjects_subject_id_foreign`);

  await knex.schema.alterTable('teacher_subjects', table => {
    table.dropUnique(['teacher_id', 'subject_id']);
    table.dropColumn('id');
  });

  await knex.raw(`ALTER TABLE teacher_subjects ADD PRIMARY KEY (teacher_id, subject_id)`);

  await knex.raw(`
    ALTER TABLE teacher_subjects
    ADD CONSTRAINT teacher_subjects_teacher_id_foreign
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
  `);

  await knex.raw(`
    ALTER TABLE teacher_subjects
    ADD CONSTRAINT teacher_subjects_subject_id_foreign
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
  `);
};
