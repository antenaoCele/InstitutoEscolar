exports.up = async function (knex) {
  await knex.schema.table("plans", (table) => {
    table.dropColumn("duration");
  });
};

exports.down = async function (knex) {
  await knex.schema.table("plans", (table) => {
    table.string("duration", 50);
  });
};
