// database/migrations/20260824203141_fix_payments_table.cjs

exports.up = function (knex) {
  return knex.schema.alterTable("payments", (table) => {
    table.string("note", 200).nullable();
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("payments", (table) => {
    table.dropColumn("note");
  });
};
