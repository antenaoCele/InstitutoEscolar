exports.up = async function (knex) {
  await knex.schema.table("plans", (table) => {
    table.dropColumn("price");
  });
};

exports.down = async function (knex) {
  await knex.schema.table("plans", (table) => {
    table.decimal("price", 10, 2);
  });
};
