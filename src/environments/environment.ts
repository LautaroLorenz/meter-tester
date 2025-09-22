import { GeneratorEnum } from '../app/models/business/enums/generator-enum.model';
import { PatternEnum } from '../app/models/business/enums/pattern-enum.model';
import { Environment } from '../app/models/core/environment.model';

export const APP_CONFIG: Environment = {
    production: false,
    environment: 'LOCAL',
    standsQuantity: 8,
    generatorType: GeneratorEnum.Manual,
    patternType: PatternEnum.Virtual,
    skipSteps: {
        photocellAdjustmentRequest: false,
        verificationMajorStep: false,
        preparationMajorStep: false,
        vacuumTestRun: false,
        bootTestRun: false,
        contrastTestRun: false
    },
    virtualMachine: false,
    logsHistory: false,
    delays: {
        patternCheckCycleDelay: 3000,
        resultsDelay: 500,
        loopDelay: 500
    }
};
