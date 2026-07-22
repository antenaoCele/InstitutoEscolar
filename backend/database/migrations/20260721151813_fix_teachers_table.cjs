exports.up = async function (knex) {
  await knex.schema.alterTable("teachers", (table) => {
    table.unique(["user_id"]);
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable("teachers", (table) => {
    table.dropUnique(["user_id"]);
  });
};
