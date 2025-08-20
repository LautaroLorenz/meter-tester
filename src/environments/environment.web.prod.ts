import { GeneratorEnum } from '../app/models/business/enums/generator-enum.model';
import { PatternEnum } from '../app/models/business/enums/pattern-enum.model';
import { Environment } from '../app/models/core/environment.model';

export const APP_CONFIG: Environment = {
    production: true,
    environment: 'WEB-PROD',
    standsQuantity: 8,
    generatorType: GeneratorEnum.Manual,
    patternType: PatternEnum.Virtual,
    skipSteps: {
        generatorAdjusted: false,
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
