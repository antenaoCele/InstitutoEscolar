exports.up = function(knex) {
  return knex.schema.createTable('schedules', table => {
    table.increments('id').primary();

    table.integer('teacher_id').unsigned().notNullable();
    table.integer('subject_id').unsigned().notNullable();

    table.time('start_time').notNullable();
    table.time('end_time').notNullable();
    table.string('days', 45); 

    table
      .foreign('teacher_id')
      .references('id')
      .inTable('teachers')
      .onDelete('CASCADE');

    table
      .foreign('subject_id')
      .references('id')
      .inTable('subjects')
      .onDelete('CASCADE');

    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('schedules');
};
