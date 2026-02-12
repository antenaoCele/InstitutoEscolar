exports.up = async function (knex) {
  await knex.schema.alterTable('schedules', table => {
    table.dropForeign('subject_id', 'schedules_subject_id_foreign');
  });

  await knex.schema.alterTable('schedules', table => {
    table.dropColumn('subject_id');
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable('schedules', table => {
    table.integer('subject_id').unsigned().notNullable();

    table
      .foreign('subject_id', 'schedules_subject_id_foreign')
      .references('id')
      .inTable('subjects')
      .onDelete('CASCADE');
  });
};
