/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  await knex("steps").insert([
    {
      id: 1,
      name: "Preparación",
      userSelectableOnCreateEssayTemplate: false,
    },
    {
      id: 2,
      name: "Prueba de vacío",
      userSelectableOnCreateEssayTemplate: true,
    },
    {
      id: 3,
      name: "Prueba de constraste",
      userSelectableOnCreateEssayTemplate: true,
    },
    {
      id: 4,
      name: "Prueba de arranque",
      userSelectableOnCreateEssayTemplate: true,
    }
  ]);
};
