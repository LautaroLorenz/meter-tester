const { faker } = require('@faker-js/faker');

models = [
  'Gyr E330',
  'T8S1',
  'A-1052',
  'Alpha-2',
  'ACE-3000',
  'HXE-310',
  'Gyr ZMG405',
  'A-150',
  'ACE-1000',
  'Gyr SP2301',
  'M5A1',
];

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function (knex) {
  const mockMeters = [];

  // generate in batches so as not to overload the query
  for (let index = 0; index < models.length; index++) {
    const id = index + 1;

    mockMeters.push({
      id,
      model: models[index],
      maximumCurrent: faker.number.int({ min: 1, max: 120 }),
      ratedCurrent: faker.number.int({ min: 1, max: 40 }),
      ratedVoltage: faker.number.int({ min: 1, max: 380 }),
      activeConstantValue: faker.number.int({ min: 1, max: 9999 }),
      reactiveConstantValue: faker.number.int({ min: 1, max: 9999 }),
      connection_id: faker.number.int({ min: 1, max: 2 }),
      brand_id: faker.number.int({ min: 1, max: 5 }),
      activeConstantUnit_id: faker.number.int({ min: 1, max: 2 }),
      reactiveConstantUnit_id: faker.number.int({ min: 1, max: 2 }),
    });
  }

  await knex('meters').insert(mockMeters);
};
