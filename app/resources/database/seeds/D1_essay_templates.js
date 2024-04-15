/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  await knex("essay_templates").insert([{ id: 1, name: "Completo" }]);
};
