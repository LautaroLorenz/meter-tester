/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.table('meters', (table) => {
    table.boolean('isBarcodeScannerEnabled').defaultTo(false);
    table.string('barcodeScannerParams_raw').nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.table('meters', (table) => {
    table.dropColumn('isBarcodeScannerEnabled');
    table.dropColumn('barcodeScannerParams_raw');
  });
};
