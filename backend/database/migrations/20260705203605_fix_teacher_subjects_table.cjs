exports.up = async function (knex) {
  // La relación teacher_subjects deja de existir.
  // Se eliminan los datos para poder modificar la estructura.
  await knex("teacher_subjects").del();

  // Eliminar restricciones existentes
  await knex.raw(`
    ALTER TABLE teacher_subjects
    DROP FOREIGN KEY teacher_subjects_teacher_id_foreign
  `);

  await knex.raw(`
    ALTER TABLE teacher_subjects
    DROP FOREIGN KEY teacher_subjects_subject_id_foreign
  `);

  await knex.raw(`
    ALTER TABLE teacher_subjects
    DROP INDEX teacher_subjects_teacher_id_subject_id_unique
  `);

  // Renombrar tabla
  await knex.schema.renameTable("teacher_subjects", "teacher_plans");

  // Modificar columnas
  await knex.schema.alterTable("teacher_plans", (table) => {
    table.dropColumn("subject_id");
    table.integer("plan_id").unsigned().notNullable();
  });

  // Crear nuevas FKs
  await knex.raw(`
    ALTER TABLE teacher_plans
    ADD CONSTRAINT teacher_plans_teacher_id_foreign
    FOREIGN KEY (teacher_id)
    REFERENCES teachers(id)
    ON DELETE CASCADE
  `);

  await knex.raw(`
    ALTER TABLE teacher_plans
    ADD CONSTRAINT teacher_plans_plan_id_foreign
    FOREIGN KEY (plan_id)
    REFERENCES plans(id)
    ON DELETE CASCADE
  `);

  // Crear índice único
  await knex.schema.alterTable("teacher_plans", (table) => {
    table.unique(["teacher_id", "plan_id"]);
  });
};

exports.down = async function (knex) {
  // La relación teacher_plan no puede convertirse nuevamente
  // en teacher_subject, por lo que se eliminan los datos.
  await knex("teacher_plans").del();

  // Eliminar restricciones nuevas
  await knex.raw(`
    ALTER TABLE teacher_plans
    DROP FOREIGN KEY teacher_plans_teacher_id_foreign
  `);

  await knex.raw(`
    ALTER TABLE teacher_plans
    DROP FOREIGN KEY teacher_plans_plan_id_foreign
  `);

  await knex.raw(`
    ALTER TABLE teacher_plans
    DROP INDEX teacher_plans_teacher_id_plan_id_unique
  `);

  // Restaurar columnas originales
  await knex.schema.alterTable("teacher_plans", (table) => {
    table.dropColumn("plan_id");
    table.integer("subject_id").unsigned().notNullable();
  });

  // Renombrar tabla
  await knex.schema.renameTable("teacher_plans", "teacher_subjects");

  // Restaurar FKs
  await knex.raw(`
    ALTER TABLE teacher_subjects
    ADD CONSTRAINT teacher_subjects_teacher_id_foreign
    FOREIGN KEY (teacher_id)
    REFERENCES teachers(id)
    ON DELETE CASCADE
  `);

  await knex.raw(`
    ALTER TABLE teacher_subjects
    ADD CONSTRAINT teacher_subjects_subject_id_foreign
    FOREIGN KEY (subject_id)
    REFERENCES subjects(id)
    ON DELETE CASCADE
  `);

  // Restaurar índice único
  await knex.schema.alterTable("teacher_subjects", (table) => {
    table.unique(["teacher_id", "subject_id"]);
  });
};
