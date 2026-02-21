exports.up = async function (knex) {
  await knex.schema.alterTable('schedules', table => {
    table.boolean('monday').notNullable().defaultTo(false);
    table.boolean('tuesday').notNullable().defaultTo(false);
    table.boolean('wednesday').notNullable().defaultTo(false);
    table.boolean('thursday').notNullable().defaultTo(false);
    table.boolean('friday').notNullable().defaultTo(false);
    table.boolean('saturday').notNullable().defaultTo(false);
  });

  await knex.schema.alterTable('schedules', table => {
    table.dropColumn('days');
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable('schedules', table => {
    table.string('days', 45);
    table.dropColumn('monday');
    table.dropColumn('tuesday');
    table.dropColumn('wednesday');
    table.dropColumn('thursday');
    table.dropColumn('friday');
    table.dropColumn('saturday');
  });
};
