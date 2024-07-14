/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('backups', (table) => {
    table.increments('id').notNullable().primary();
    table.integer('saved_time');
    table.string('selected_folder');
    table.string('file_name');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('backups');
};
