const { runSeed } = require('../seeds-updater');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  const table = 'steps';
  const curretVersion = '1.0.0';
  await runSeed(knex, table, curretVersion, async () => {
    await knex(table)
      .insert([
        {
          id: 1,
          name: 'Preparación',
          userSelectableOnCreateEssayTemplate: false,
        },
        {
          id: 2,
          name: 'Prueba de vacío',
          userSelectableOnCreateEssayTemplate: true,
        },
        {
          id: 3,
          name: 'Prueba de constraste',
          userSelectableOnCreateEssayTemplate: true,
        },
        {
          id: 4,
          name: 'Prueba de arranque',
          userSelectableOnCreateEssayTemplate: true,
        },
      ])
      .onConflict('id')
      .merge();
  });
};
