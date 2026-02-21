exports.up = async function (knex) {
  await knex.schema.table("student_plans", (table) => {
    table
      .integer("teacher_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("teachers")
      .onDelete("CASCADE"); 
  });
};

exports.down = async function (knex) {
  await knex.schema.table("student_plans", (table) => {
    table.dropColumn("teacher_id");
  });
};

