/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.table("history_essay_step_stand", (table) => {
    table.integer("result_value");
    table.string("result_unit");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.table("history_essay_step_stand", (table) => {
    table.dropColumn("result_value");
    table.dropColumn("result_unit");
  });
};