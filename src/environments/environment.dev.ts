import { GeneratorEnum } from '../app/models/business/enums/generator-enum.model';
import { PatternEnum } from '../app/models/business/enums/pattern-enum.model';
import { Environment } from '../app/models/core/environment.model';

export const APP_CONFIG: Environment = {
    production: false,
    environment: 'DEV',
    standsQuantity: 2,
    generatorType: GeneratorEnum.SemiautomaticPYC5050,
    patternType: PatternEnum.Sm5050,
    skipSteps: {
        photocellAdjustmentRequest: false,
        verificationMajorStep: true,
        preparationMajorStep: true,
        vacuumTestRun: false,
        bootTestRun: false,
        contrastTestRun: false
    },
    virtualMachine: true,
    logsHistory: false,
    delays: {
        patternCheckCycleDelay: 3000,
        resultsDelay: 500,
        loopDelay: 500
    }
};
