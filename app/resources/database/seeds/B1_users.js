/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function (knex) {
  await knex('users').insert([
    { id: 1, name: 'Marcelo', surname: 'Lorenz', identification: 'Laboratorio' },
    { id: 2, name: 'Lautaro', surname: 'Lorenz', identification: 'Calidad' },
    { id: 3, name: 'Gustavo', surname: 'Celestino', identification: 'Calibraciones' },
    { id: 4, name: 'Gabriel', surname: 'Maciel', identification: 'Laboratorio' },
  ]);
};
