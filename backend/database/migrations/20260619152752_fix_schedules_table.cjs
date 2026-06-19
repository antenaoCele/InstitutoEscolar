exports.up = async function (knex) {
  const hasColumn = await knex.schema.hasColumn("schedules", "subject_id");

  if (hasColumn) {
    await knex.schema.alterTable("schedules", (table) => {
      table.dropColumn("subject_id");
    });
  }
};

exports.down = async function (knex) {
  const hasColumn = await knex.schema.hasColumn("schedules", "subject_id");

  if (!hasColumn) {
    await knex.schema.alterTable("schedules", (table) => {
      table.integer("subject_id").unsigned().notNullable();
    });
  }
};
