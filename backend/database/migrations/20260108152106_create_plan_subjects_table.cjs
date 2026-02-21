exports.up = function(knex) {
  return knex.schema.createTable('plan_subjects', table => {
    table.integer('plan_id').unsigned().notNullable();
    table.integer('subject_id').unsigned().notNullable();

    table.primary(['plan_id', 'subject_id']);

    table
      .foreign('plan_id')
      .references('id')
      .inTable('plans')
      .onDelete('CASCADE');

    table
      .foreign('subject_id')
      .references('id')
      .inTable('subjects')
      .onDelete('CASCADE');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('plan_subjects');
};
