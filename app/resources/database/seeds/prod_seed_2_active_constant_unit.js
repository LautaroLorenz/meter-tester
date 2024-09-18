const { runSeed } = require('../seeds-updater');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 * @Warning We need specific this id values (1 and 2).
 */
exports.seed = async function (knex) {
  const table = 'active_constant_unit';
  const curretVersion = '1.0.0';
  await runSeed(knex, table, curretVersion, async () => {
    await knex(table)
      .insert([
        { id: 1, name: 'imp/kwh' },
        { id: 2, name: 'wh/imp' },
      ])
      .onConflict('id')
      .merge();
  });
};
