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
      form_control_raw: `[{"name":"Puesto 01","isActive":true,"meter_id":7,"serialNumber":"111","yearOfProduction":2024,"foreign":null},{"name":"Puesto 02","isActive":true,"meter_id":7,"serialNumber":"222","yearOfProduction":2024,"foreign":null},{"name":"Puesto 03","isActive":true,"meter_id":7,"serialNumber":"333","yearOfProduction":2024,"foreign":null},{"name":"Puesto 04","isActive":false,"meter_id":null,"serialNumber":null,"yearOfProduction":null,"foreign":null},{"name":"Puesto 05","isActive":false,"meter_id":null,"serialNumber":null,"yearOfProduction":null,"foreign":null},{"name":"Puesto 06","isActive":false,"meter_id":null,"serialNumber":null,"yearOfProduction":null,"foreign":null},{"name":"Puesto 07","isActive":true,"meter_id":7,"serialNumber":"777","yearOfProduction":2003,"foreign":null},{"name":"Puesto 08","isActive":false,"meter_id":null,"serialNumber":null,"yearOfProduction":null,"foreign":null},{"name":"Puesto 09","isActive":false,"meter_id":null,"serialNumber":null,"yearOfProduction":null,"foreign":null},{"name":"Puesto 10","isActive":false,"meter_id":null,"serialNumber":null,"yearOfProduction":null,"foreign":null}]`,
    },
    {
      id: 2,
      order: 1,
      essay_template_id: 1,
      step_id: 4,
      form_control_raw: `{"name":"Arranque","meterConstant":0,"phaseL1":{"voltage":1,"current":4,"anglePhi":7},"phaseL2":{"voltage":2,"current":5,"anglePhi":8},"phaseL3":{"voltage":3,"current":6,"anglePhi":9},"allowedPulses":1,"minDurationSeconds":0,"maxDurationSeconds":0}`,
    },
    {
      id: 3,
      order: 2,
      essay_template_id: 1,
      step_id: 3,
      form_control_raw: `{"name":"Contraste","meterConstant":0,"phaseL1":{"voltage":1,"current":4,"anglePhi":7},"phaseL2":{"voltage":2,"current":5,"anglePhi":8},"phaseL3":{"voltage":3,"current":6,"anglePhi":9},"maxAllowedError":1,"meterPulses":2}`,
    },
    {
      id: 4,
      order: 3,
      essay_template_id: 1,
      step_id: 2,
      form_control_raw: `{"name":"Vacío","meterConstant":0,"phaseL1":{"voltage":1},"phaseL2":{"voltage":2},"phaseL3":{"voltage":3},"maxAllowedPulses":1,"durationSeconds":2}`,
    },
  ]);
};
