/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .createTable('statics', (table) => {
      table.increments('id').notNullable().primary();
      table.integer('saved_time');
      table.string('metric');
      table.string('tags_raw');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .dropTable("statics");
};
