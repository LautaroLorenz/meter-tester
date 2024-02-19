/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function (knex) {
  await knex('essay_templates_steps').insert([
    { id: 1, name: 'Test contraste', order: 1, essay_template_id: 1, step_id: 4, actions_raw_data: '{"actions":[{"actionName":"Identificación de puestos","stands":[{"standIndex":1,"isActive":true,"meterId":3,"serialNumber":"5+45+645+","yearOfProduction":2022},{"standIndex":2,"isActive":false,"meterId":null,"serialNumber":null,"yearOfProduction":null},{"standIndex":3,"isActive":false,"meterId":null,"serialNumber":null,"yearOfProduction":null}]},{"actionName":"Valores generales de la prueba","meterConstant":0,"phaseL1":{"voltageU1":2200,"currentI1":50,"anglePhi1":0},"phaseL2":{"voltageU2":2200,"currentI2":50,"anglePhi2":0},"phaseL3":{"voltageU3":2200,"currentI3":50,"anglePhi3":0}},{"actionName":"Parámetros para la prueba de contraste","maxAllowedError":1,"meterPulses":5,"numberOfDiscardedResults":3},{"actionName":"Realizar prueba de contraste","executionComplete":null}]}' },
    { id: 2, name: null, order: 2, essay_template_id: 1, step_id: 1, actions_raw_data: '[]' },
    { id: 3, name: 'Test vacío', order: 1, essay_template_id: 2, step_id: 2, actions_raw_data: '{"actions":[{"actionName":"Identificación de puestos","stands":[{"standIndex":1,"isActive":true,"meterId":3,"serialNumber":"564654564","yearOfProduction":2020},{"standIndex":2,"isActive":false,"meterId":null,"serialNumber":null,"yearOfProduction":null},{"standIndex":3,"isActive":false,"meterId":null,"serialNumber":null,"yearOfProduction":null}]},{"actionName":"Valores generales de la prueba","meterConstant":0,"phaseL1":{"voltageU1":2200,"currentI1":50,"anglePhi1":0},"phaseL2":{"voltageU2":2200,"currentI2":50,"anglePhi2":0},"phaseL3":{"voltageU3":2200,"currentI3":50,"anglePhi3":0}},{"actionName":"Parámetros para la prueba de vacío","maxAllowedPulses":5,"durationSeconds":7},{"actionName":"Realizar prueba de vacío","executionComplete":null}]}' },
    { id: 4, name: null, order: 2, essay_template_id: 2, step_id: 1, actions_raw_data: '[]' },
  ]);
};
