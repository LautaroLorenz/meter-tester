/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries in foreign keys order
  await knex('statics').del();
  await knex('history').del();
  await knex('essay_templates_steps').del();
  await knex('steps').del();
  await knex('essay_templates').del();
  await knex('meters').del();
  await knex('brands').del();
  await knex('users').del();
  await knex('reactive_constant_unit').del();
  await knex('active_constant_unit').del();
  await knex('connections').del();
};
