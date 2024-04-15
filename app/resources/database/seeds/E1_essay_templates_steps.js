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
      form_control_raw: `[{"name":"Puesto 01","isActive":true,"meter":{"id":1,"model":"Gyr E330","maximumCurrent":16,"ratedCurrent":9,"ratedVoltage":186,"activeConstantValue":3230,"reactiveConstantValue":4919,"brand_id":2,"connection_id":2,"activeConstantUnit_id":1,"reactiveConstantUnit_id":1,"foreign":{"connection":{"id":2,"name":"Monofásico"},"brand":{"id":2,"name":"Actaris"},"activeConstantUnit":{"id":1,"name":"imp/kwh"},"reactiveConstantUnit":{"id":1,"name":"imp/kvarh"}},"label":"Actaris - Gyr E330"},"serialNumber":"111","yearOfProduction":2024},{"name":"Puesto 02","isActive":true,"meter":{"id":1,"model":"Gyr E330","maximumCurrent":16,"ratedCurrent":9,"ratedVoltage":186,"activeConstantValue":3230,"reactiveConstantValue":4919,"brand_id":2,"connection_id":2,"activeConstantUnit_id":1,"reactiveConstantUnit_id":1,"foreign":{"connection":{"id":2,"name":"Monofásico"},"brand":{"id":2,"name":"Actaris"},"activeConstantUnit":{"id":1,"name":"imp/kwh"},"reactiveConstantUnit":{"id":1,"name":"imp/kvarh"}},"label":"Actaris - Gyr E330"},"serialNumber":"222","yearOfProduction":2024},{"name":"Puesto 03","isActive":true,"meter":{"id":1,"model":"Gyr E330","maximumCurrent":16,"ratedCurrent":9,"ratedVoltage":186,"activeConstantValue":3230,"reactiveConstantValue":4919,"brand_id":2,"connection_id":2,"activeConstantUnit_id":1,"reactiveConstantUnit_id":1,"foreign":{"connection":{"id":2,"name":"Monofásico"},"brand":{"id":2,"name":"Actaris"},"activeConstantUnit":{"id":1,"name":"imp/kwh"},"reactiveConstantUnit":{"id":1,"name":"imp/kvarh"}},"label":"Actaris - Gyr E330"},"serialNumber":"333","yearOfProduction":2024},{"name":"Puesto 04","isActive":true,"meter":{"id":1,"model":"Gyr E330","maximumCurrent":16,"ratedCurrent":9,"ratedVoltage":186,"activeConstantValue":3230,"reactiveConstantValue":4919,"brand_id":2,"connection_id":2,"activeConstantUnit_id":1,"reactiveConstantUnit_id":1,"foreign":{"connection":{"id":2,"name":"Monofásico"},"brand":{"id":2,"name":"Actaris"},"activeConstantUnit":{"id":1,"name":"imp/kwh"},"reactiveConstantUnit":{"id":1,"name":"imp/kvarh"}},"label":"Actaris - Gyr E330"},"serialNumber":"444","yearOfProduction":2024},{"name":"Puesto 05","isActive":true,"meter":{"id":1,"model":"Gyr E330","maximumCurrent":16,"ratedCurrent":9,"ratedVoltage":186,"activeConstantValue":3230,"reactiveConstantValue":4919,"brand_id":2,"connection_id":2,"activeConstantUnit_id":1,"reactiveConstantUnit_id":1,"foreign":{"connection":{"id":2,"name":"Monofásico"},"brand":{"id":2,"name":"Actaris"},"activeConstantUnit":{"id":1,"name":"imp/kwh"},"reactiveConstantUnit":{"id":1,"name":"imp/kvarh"}},"label":"Actaris - Gyr E330"},"serialNumber":"555","yearOfProduction":2024},{"name":"Puesto 06","isActive":true,"meter":{"id":1,"model":"Gyr E330","maximumCurrent":16,"ratedCurrent":9,"ratedVoltage":186,"activeConstantValue":3230,"reactiveConstantValue":4919,"brand_id":2,"connection_id":2,"activeConstantUnit_id":1,"reactiveConstantUnit_id":1,"foreign":{"connection":{"id":2,"name":"Monofásico"},"brand":{"id":2,"name":"Actaris"},"activeConstantUnit":{"id":1,"name":"imp/kwh"},"reactiveConstantUnit":{"id":1,"name":"imp/kvarh"}},"label":"Actaris - Gyr E330"},"serialNumber":"666","yearOfProduction":2024},{"name":"Puesto 07","isActive":true,"meter":{"id":1,"model":"Gyr E330","maximumCurrent":16,"ratedCurrent":9,"ratedVoltage":186,"activeConstantValue":3230,"reactiveConstantValue":4919,"brand_id":2,"connection_id":2,"activeConstantUnit_id":1,"reactiveConstantUnit_id":1,"foreign":{"connection":{"id":2,"name":"Monofásico"},"brand":{"id":2,"name":"Actaris"},"activeConstantUnit":{"id":1,"name":"imp/kwh"},"reactiveConstantUnit":{"id":1,"name":"imp/kvarh"}},"label":"Actaris - Gyr E330"},"serialNumber":"777","yearOfProduction":2024},{"name":"Puesto 08","isActive":true,"meter":{"id":1,"model":"Gyr E330","maximumCurrent":16,"ratedCurrent":9,"ratedVoltage":186,"activeConstantValue":3230,"reactiveConstantValue":4919,"brand_id":2,"connection_id":2,"activeConstantUnit_id":1,"reactiveConstantUnit_id":1,"foreign":{"connection":{"id":2,"name":"Monofásico"},"brand":{"id":2,"name":"Actaris"},"activeConstantUnit":{"id":1,"name":"imp/kwh"},"reactiveConstantUnit":{"id":1,"name":"imp/kvarh"}},"label":"Actaris - Gyr E330"},"serialNumber":"888","yearOfProduction":2024},{"name":"Puesto 09","isActive":true,"meter":{"id":1,"model":"Gyr E330","maximumCurrent":16,"ratedCurrent":9,"ratedVoltage":186,"activeConstantValue":3230,"reactiveConstantValue":4919,"brand_id":2,"connection_id":2,"activeConstantUnit_id":1,"reactiveConstantUnit_id":1,"foreign":{"connection":{"id":2,"name":"Monofásico"},"brand":{"id":2,"name":"Actaris"},"activeConstantUnit":{"id":1,"name":"imp/kwh"},"reactiveConstantUnit":{"id":1,"name":"imp/kvarh"}},"label":"Actaris - Gyr E330"},"serialNumber":"999","yearOfProduction":2024},{"name":"Puesto 10","isActive":true,"meter":{"id":1,"model":"Gyr E330","maximumCurrent":16,"ratedCurrent":9,"ratedVoltage":186,"activeConstantValue":3230,"reactiveConstantValue":4919,"brand_id":2,"connection_id":2,"activeConstantUnit_id":1,"reactiveConstantUnit_id":1,"foreign":{"connection":{"id":2,"name":"Monofásico"},"brand":{"id":2,"name":"Actaris"},"activeConstantUnit":{"id":1,"name":"imp/kwh"},"reactiveConstantUnit":{"id":1,"name":"imp/kvarh"}},"label":"Actaris - Gyr E330"},"serialNumber":"000","yearOfProduction":2024}]`,
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
