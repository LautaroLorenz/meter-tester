/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  await knex("steps").insert([
    {
      id: 1,
      name: "Reporte",
      userSelectableOnCreateEssayTemplate: false,
    },
    {
      id: 2,
      name: "Prueba de vacío",
      userSelectableOnCreateEssayTemplate: true,
    },
    {
      id: 3,
      name: "Prueba de integración",
      userSelectableOnCreateEssayTemplate: false,
    },
    {
      id: 4,
      name: "Prueba de constraste",
      userSelectableOnCreateEssayTemplate: true,
    },
    {
      id: 5,
      name: "Prueba de arranque",
      userSelectableOnCreateEssayTemplate: true,
    },
    {
      id: 6,
      name: "Ajuste de fotocélulas",
      userSelectableOnCreateEssayTemplate: false,
    },
    {
      id: 7,
      name: "Identificación de usuario",
      userSelectableOnCreateEssayTemplate: false,
    },
  ]);
};
