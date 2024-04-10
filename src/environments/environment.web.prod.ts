import { Environment } from '../app/models/core/environment.model';

export const APP_CONFIG: Environment = {
  production: true,
  environment: 'WEB-PROD',
  standsQuantiy: 10,
  commandStandsQuantity: 20,
  skipSteps: {
    manualGeneratorConfirm: false,
    photocellAdjustmentRequest: false,
    verificationMajorStep: false,
    preparationMajorStep: false,
    vacuumTestRun: false,
    bootTestRun: false,
    contrastTestRun: false,
  },
  virtualMachine: false,
};
