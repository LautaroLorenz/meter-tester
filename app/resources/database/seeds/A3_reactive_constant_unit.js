/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 * @Warning We need specific this id values (1 and 2).
 */
exports.seed = async function (knex) {
  await knex('reactive_constant_unit').insert([
    { id: 1, name: 'imp/kvarh' },
    { id: 2, name: 'varh/imp' },
  ]);
};