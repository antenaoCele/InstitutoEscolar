exports.up = async function (knex) {
  await knex.schema.alterTable("teachers", (table) => {
    table.boolean("active").notNullable().defaultTo(true);
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable("teachers", (table) => {
    table.dropColumn("active");
  });
};
