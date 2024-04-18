/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("history_essay", (table) => {
    table.increments("id").notNullable().primary();
    table.integer("saved_time");
    table.string("essay_name");
    table.string("step_name");
    table
      .integer("meter_id")
      .notNullable()
      .references("id")
      .inTable("meters")
      .onDelete("RESTRICT");
    table.string("serial_number");
    table.string("year_of_production");
    table.string("result_status_enum").notNullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("history_essay");
};
