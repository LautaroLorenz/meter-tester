/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 * @Warning We need specific this id values (1 and 2).
 */
exports.seed = async function (knex) {
  await knex('active_constant_unit').insert([
    { id: 1, name: 'imp/kwh' },
    { id: 2, name: 'wh/imp' },
  ]);
};