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
      name: "Ajuste de fotocélulas",
      userSelectableOnCreateEssayTemplate: false,
    },
    {
      id: 3,
      name: "Reporte",
      userSelectableOnCreateEssayTemplate: false,
    },
    {
      id: 4,
      name: "Prueba de vacío",
      userSelectableOnCreateEssayTemplate: true,
    },
    {
      id: 5,
      name: "Prueba de constraste",
      userSelectableOnCreateEssayTemplate: true,
    },
    {
      id: 6,
      name: "Prueba de arranque",
      userSelectableOnCreateEssayTemplate: true,
    }
  ]);
};
