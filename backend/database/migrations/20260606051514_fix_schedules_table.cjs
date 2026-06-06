exports.up = async function (knex) {
  await knex.schema.alterTable("schedules", (table) => {
    table.integer("subject_id").unsigned().notNullable();

    table.foreign("subject_id").references("id").inTable("subjects");
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable("schedules", (table) => {
    table.dropForeign("subject_id");
    table.dropColumn("subject_id");
  });
};
