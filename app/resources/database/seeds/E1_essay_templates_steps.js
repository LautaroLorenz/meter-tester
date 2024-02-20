/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function (knex) {
  await knex('essay_templates_steps').insert([
    { id: 1, name: 'Test contraste', order: 1, essay_template_id: 1, step_id: 4, form_control_raw: '{}' },
    { id: 2, name: null, order: 2, essay_template_id: 1, step_id: 1, form_control_raw: '{}' },
    { id: 3, name: 'Test vacío', order: 1, essay_template_id: 2, step_id: 2, form_control_raw: '{}' },
    { id: 4, name: null, order: 2, essay_template_id: 2, step_id: 1, form_control_raw: '{}' },
  ]);
};
