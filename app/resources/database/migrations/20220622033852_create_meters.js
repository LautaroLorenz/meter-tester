/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .createTable('meters', (table) => {
      table.increments('id').notNullable().primary();
      table.string('model').notNullable();
      table.integer('maximumCurrent').notNullable();
      table.integer('ratedCurrent').notNullable();
      table.integer('ratedVoltage').notNullable();
      table.integer('activeConstantValue').notNullable();
      table.integer('reactiveConstantValue').notNullable();
      table.integer('brand_id').notNullable().references('id').inTable('brands').onDelete('RESTRICT');
      table.integer('connection_id').notNullable().references('id').inTable('connections').onDelete('CASCADE');
      table.integer('activeConstantUnit_id').notNullable().references('id').inTable('active_constant_unit').onDelete('CASCADE');
      table.integer('reactiveConstantUnit_id').notNullable().references('id').inTable('reactive_constant_unit').onDelete('CASCADE');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .dropTable("meters");
};
