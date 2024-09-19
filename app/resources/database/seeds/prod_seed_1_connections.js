const { runSeed } = require('../seeds-updater');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 * @Warning We need specific this id values (1 and 2).
 */
exports.seed = async function (knex) {
  const table = 'connections';
  const curretVersion = '1.0.0';
  await runSeed(knex, table, curretVersion, async () => {
    await knex(table)
      .insert([
        { id: 1, name: 'Trifásico' },
        { id: 2, name: 'Monofásico' },
      ])
      .onConflict('id')
      .merge();
  });
};
