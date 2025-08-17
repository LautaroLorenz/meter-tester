import { Environment } from '../app/models/core/environment.model';

export const APP_CONFIG: Environment = {
    production: false,
    environment: 'DEV',
    standsQuantity: 8,
    patternType: 'Virtual',
    skipSteps: {
        manualGeneratorConfirm: false,
        photocellAdjustmentRequest: false,
        verificationMajorStep: true,
        preparationMajorStep: true,
        vacuumTestRun: false,
        bootTestRun: false,
        contrastTestRun: false
    },
    virtualMachine: true,
    logsHistory: true
};
