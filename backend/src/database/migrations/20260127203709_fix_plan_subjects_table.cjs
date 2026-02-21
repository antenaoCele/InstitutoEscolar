exports.up = async function(knex) {

  // Borrar foreign keys actuales
  await knex.raw(`
    ALTER TABLE plan_subjects DROP FOREIGN KEY plan_subjects_plan_id_foreign
  `);

  await knex.raw(`
    ALTER TABLE plan_subjects DROP FOREIGN KEY plan_subjects_subject_id_foreign
  `);

  // Borrar primary key compuesta
  await knex.raw(`
    ALTER TABLE plan_subjects DROP PRIMARY KEY
  `);

  // Agregar id autoincremental como nueva PK
  await knex.schema.alterTable('plan_subjects', table => {
    table.increments('id').primary();
  });

  // Mantener combinación única
  await knex.schema.alterTable('plan_subjects', table => {
    table.unique(['plan_id', 'subject_id']);
  });

  // Volver a crear las foreign keys
  await knex.raw(`
    ALTER TABLE plan_subjects
    ADD CONSTRAINT plan_subjects_plan_id_foreign
    FOREIGN KEY (plan_id) REFERENCES plans(id)
    ON DELETE CASCADE
  `);

  await knex.raw(`
    ALTER TABLE plan_subjects
    ADD CONSTRAINT plan_subjects_subject_id_foreign
    FOREIGN KEY (subject_id) REFERENCES subjects(id)
    ON DELETE CASCADE
  `);
};


exports.down = async function(knex) {

  // Borrar FKs
  await knex.raw(`
    ALTER TABLE plan_subjects DROP FOREIGN KEY plan_subjects_plan_id_foreign
  `);

  await knex.raw(`
    ALTER TABLE plan_subjects DROP FOREIGN KEY plan_subjects_subject_id_foreign
  `);

  // Borrar unique
  await knex.schema.alterTable('plan_subjects', table => {
    table.dropUnique(['plan_id', 'subject_id']);
  });

  // Borrar id
  await knex.schema.alterTable('plan_subjects', table => {
    table.dropColumn('id');
  });

  // Restaurar PK compuesta
  await knex.raw(`
    ALTER TABLE plan_subjects ADD PRIMARY KEY (plan_id, subject_id)
  `);

  // Restaurar FKs
  await knex.raw(`
    ALTER TABLE plan_subjects
    ADD CONSTRAINT plan_subjects_plan_id_foreign
    FOREIGN KEY (plan_id) REFERENCES plans(id)
    ON DELETE CASCADE
  `);

  await knex.raw(`
    ALTER TABLE plan_subjects
    ADD CONSTRAINT plan_subjects_subject_id_foreign
    FOREIGN KEY (subject_id) REFERENCES subjects(id)
    ON DELETE CASCADE
  `);
};
