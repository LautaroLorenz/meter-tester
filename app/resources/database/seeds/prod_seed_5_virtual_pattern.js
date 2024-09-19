const { runSeed } = require('../seeds-updater');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  const table = 'virtual_patterns';
  const curretVersion = '1.0.0';
  await runSeed(knex, table, curretVersion, async () => {
    await knex(table)
      .insert([
        {
          id: 1,
          current: 0.5,
          constant: 20e6,
        },
        {
          id: 2,
          current: 1,
          constant: 10e6,
        },
        {
          id: 3,
          current: 2,
          constant: 5e6,
        },
        {
          id: 4,
          current: 5,
          constant: 2e6,
        },
        {
          id: 5,
          current: 10,
          constant: 1e6,
        },
        {
          id: 6,
          current: 20,
          constant: 5e5,
        },
        {
          id: 7,
          current: 50,
          constant: 2e5,
        },
        {
          id: 8,
          current: 100,
          constant: 1e5,
        },
      ])
      .onConflict('id')
      .merge();
  });
};
