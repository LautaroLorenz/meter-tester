/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .createTable('essay_templates_steps', (table) => {
      table.increments('id').notNullable().primary();
      table.string('name');
      table.integer('order').notNullable();
      table.string('form_control_raw');
      table.integer('essay_template_id').notNullable().references('id').inTable('essay_templates').onDelete('CASCADE');
      table.integer('step_id').notNullable().references('id').inTable('steps').onDelete('RESTRICT');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .dropTable("essay_templates_steps");
};
