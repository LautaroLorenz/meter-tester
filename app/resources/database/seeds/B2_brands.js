/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function (knex) {
  await knex('brands').insert([
    { id: 1, name: 'ABB' },
    { id: 2, name: 'Actaris' },
    { id: 3, name: 'Elster' },
    { id: 4, name: 'Hexing' },
    { id: 5, name: 'Landis' },
  ]);
};
