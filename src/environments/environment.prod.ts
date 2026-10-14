import { Environment } from '../app/models/core/environment.model';
import { CLIENT } from './client';

// Los valores del cliente vienen de src/environments/client.<cliente>.ts: no editar acá para cada release
export const APP_CONFIG: Environment = {
    production: true,
    environment: 'PROD',
    ...CLIENT,
    skipSteps: {
        photocellAdjustmentRequest: false,
        verificationMajorStep: false,
        preparationMajorStep: false,
        vacuumTestRun: false,
        bootTestRun: false,
        contrastTestRun: false,
        integrationTestRun: false
    },
    virtualMachine: false,
    logsHistory: false,
    delays: {
        patternCheckCycleDelay: 50,
        resultsDelay: 50,
        loopDelay: 50
    }
};
