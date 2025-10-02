import { GeneratorEnum } from '../app/models/business/enums/generator-enum.model';
import { PatternEnum } from '../app/models/business/enums/pattern-enum.model';
import { Environment } from '../app/models/core/environment.model';

export const APP_CONFIG: Environment = {
    production: true,
    environment: 'PROD',
    standsQuantity: 20,
    generatorType: GeneratorEnum.SemiautomaticPYC5050,
    patternType: PatternEnum.Sm5050,
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
