// const essays = ["Ensayo de contraste 1%", "Preparación"];

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function (knex) {
  await knex('essay_templates').insert([
    { id: 1, name: 'Ensayo de contraste' },
    { id: 2, name: 'Ensayo de vacio' },
  ]);
};
