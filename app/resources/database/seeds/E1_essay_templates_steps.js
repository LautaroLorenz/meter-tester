/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  await knex("essay_templates_steps").insert([
    {
      id: 1,
      order: 0,
      essay_template_id: 1,
      step_id: 1,
      form_control_raw: "[]",
    },
    {
      id: 2,
      order: 1,
      essay_template_id: 1,
      step_id: 4,
      form_control_raw: `{
        "name": "11 impulsos por 5 minutos en Reactiva",
        "meterConstant": 1,
        "phaseL1": {
            "voltage": 1
        },
        "phaseL2": {
            "voltage": 2
        },
        "phaseL3": {
            "voltage": 3
        },
        "maxAllowedPulses": 11,
        "durationSeconds": 300
      }`,
    },
    {
      id: 3,
      order: 2,
      essay_template_id: 1,
      step_id: 5,
      form_control_raw: `{
          "name": "5% de error con 20 impulsos en Reactiva",
          "meterConstant": 1,
          "phaseL1": {
              "voltage": 1,
              "current": 4,
              "anglePhi": 7
          },
          "phaseL2": {
              "voltage": 2,
              "current": 5,
              "anglePhi": 8
          },
          "phaseL3": {
              "voltage": 3,
              "current": 6,
              "anglePhi": 9
          },
          "maxAllowedError": 5,
          "meterPulses": 20
      }`,
    },
    {
      id: 4,
      order: 3,
      essay_template_id: 1,
      step_id: 6,
      form_control_raw: `{
          "name": "entre 5 y 10 segundos con 20 imp Activa",
          "meterConstant": 0,
          "phaseL1": {
              "voltage": 1,
              "current": 4,
              "anglePhi": 7
          },
          "phaseL2": {
              "voltage": 2,
              "current": 5,
              "anglePhi": 8
          },
          "phaseL3": {
              "voltage": 3,
              "current": 6,
              "anglePhi": 9
          },
          "allowedPulses": 20,
          "minDurationSeconds": 5,
          "maxDurationSeconds": 10
      }`,
    },
  ]);
};
