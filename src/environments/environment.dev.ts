import { Environment } from '../app/models/core/environment.model';

export const APP_CONFIG: Environment = {
    production: false,
    environment: 'DEV',
    standsQuantity: 20,
    patternType: 'Virtual',
    skipSteps: {
        manualGeneratorConfirm: false,
        photocellAdjustmentRequest: true,
        verificationMajorStep: true,
        preparationMajorStep: false,
        vacuumTestRun: false,
        bootTestRun: false,
        contrastTestRun: false
    },
    virtualMachine: true,
    logsHistory: true
};
