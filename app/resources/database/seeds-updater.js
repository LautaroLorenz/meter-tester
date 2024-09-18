async function needsUpdateSeed(seed, currentSeedVersion, knex) {
  const seedConfig = await knex('seeds_config')
    .where('key', seed + '_last_update')
    .first();
  return !seedConfig || seedConfig.value !== currentSeedVersion;
}

async function updateSeedVersion(seed, newSeedVersion, knex) {
  await knex('seeds_config')
    .insert({
      key: seed + '_last_update',
      value: newSeedVersion,
      updated_at: knex.fn.now(),
    })
    .onConflict('key')
    .merge();
}

async function runSeed(knex, table, curretVersion, seedFn) {
  const isNeedsUpdateSeed = await needsUpdateSeed(table, curretVersion, knex);
  if (!isNeedsUpdateSeed) {
    return;
  }
  await seedFn();
  await updateSeedVersion(table, curretVersion, knex);
}

module.exports = {
  runSeed,
};
