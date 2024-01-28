/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function (knex) {
  await knex('steps').insert([
    { id: 1, name: 'Reporte' },
    { id: 2, name: 'Prueba de vacío' },
    // { id: 3, name: 'Prueba de integración' },
    { id: 4, name: 'Prueba de constraste' },
    { id: 5, name: 'Prueba de arranque' },
    { id: 6, name: 'Ajuste de fotocélulas' },
    { id: 7, name: 'Identificación de usuario' },
  ]);
};
