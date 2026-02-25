exports.up = async function (knex) {
  await knex.schema.table("students", (table) => {
    table.dropColumn("enrolled");
  });
};

exports.down = async function (knex) {
  await knex.schema.table("students", (table) => {
    table.boolean("enrolled").defaultTo(false);
  });
};
