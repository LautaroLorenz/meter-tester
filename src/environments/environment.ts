import { Environment } from '../app/models/core/environment.model';

export const APP_CONFIG: Environment = {
    production: false,
    environment: 'LOCAL',
    standsQuantity: 8,
    generatorType: 'Manual',
    patternType: 'Virtual',
    skipSteps: {
        manualGeneratorConfirm: false,
        photocellAdjustmentRequest: false,
        verificationMajorStep: false,
        preparationMajorStep: false,
        vacuumTestRun: false,
        bootTestRun: false,
        contrastTestRun: false
    },
    virtualMachine: false,
    logsHistory: false
};
