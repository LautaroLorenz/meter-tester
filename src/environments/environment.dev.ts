import { Environment } from '../app/models/core/environment.model';

export const APP_CONFIG: Environment = {
    production: false,
    environment: 'DEV',
    standsQuantiy: 10,
    commandStandsQuantity: 20,
    skipSteps: {
        manualGeneratorConfirm: false,
        photocellAdjustmentRequest: true,
        verificationMajorStep: true,
        preparationMajorStep: true,
        vacuumTestRun: false,
        bootTestRun: false,
        contrastTestRun: false
    },
    virtualMachine: false,
    logsHistory: true
};
