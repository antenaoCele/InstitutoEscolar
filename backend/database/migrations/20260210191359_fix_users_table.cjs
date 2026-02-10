
exports.up = async function (knex) {
  await knex.schema.alterTable('users', table => {
    table.string('role').notNullable().defaultTo('docente');
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable('users', table => {
    table.dropColumn('role');
  });
};
