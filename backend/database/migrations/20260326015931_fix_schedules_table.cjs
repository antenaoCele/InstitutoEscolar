exports.up = async function (knex) {
  await knex.schema.alterTable("schedules", (table) => {
    table.dropColumn("monday");
    table.dropColumn("tuesday");
    table.dropColumn("wednesday");
    table.dropColumn("thursday");
    table.dropColumn("friday");
    table.dropColumn("saturday");

    table.integer("day").notNullable();

    table.string("classroom", 10).notNullable();

    table.unique(["teacher_id", "day", "start_time", "end_time"]);
    table.unique(["classroom", "day", "start_time", "end_time"]);
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable("schedules", (table) => {
    table.dropUnique(["teacher_id", "day", "start_time", "end_time"]);
    table.dropUnique(["classroom", "day", "start_time", "end_time"]);

    table.dropColumn("classroom");
    table.dropColumn("day");

    table.boolean("monday").defaultTo(false);
    table.boolean("tuesday").defaultTo(false);
    table.boolean("wednesday").defaultTo(false);
    table.boolean("thursday").defaultTo(false);
    table.boolean("friday").defaultTo(false);
    table.boolean("saturday").defaultTo(false);
  });
};
