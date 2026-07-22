exports.up = async function (knex) {
  // Agregar la columna user_id
  await knex.schema.alterTable("teachers", (table) => {
    table.integer("user_id").unsigned().nullable();
  });

  // Crear la Foreign Key
  await knex.raw(`
    ALTER TABLE teachers
    ADD CONSTRAINT teachers_user_id_foreign
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE SET NULL
  `);
};

exports.down = async function (knex) {
  // Eliminar la Foreign Key
  await knex.raw(`
    ALTER TABLE teachers
    DROP FOREIGN KEY teachers_user_id_foreign
  `);

  // Eliminar la columna
  await knex.schema.alterTable("teachers", (table) => {
    table.dropColumn("user_id");
  });
};
