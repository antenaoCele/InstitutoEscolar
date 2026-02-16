exports.up = async function (knex) {
  await knex.schema.table("teachers", (table) => {
    table.dropColumn("salary");
  });
};

exports.down = async function (knex) {
  await knex.schema.table("teachers", (table) => {
    table.decimal("salary", 10, 2);
  });
};
