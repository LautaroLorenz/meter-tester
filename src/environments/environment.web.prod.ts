import { GeneratorEnum } from '../app/models/business/enums/generator-enum.model';
import { PatternEnum } from '../app/models/business/enums/pattern-enum.model';
import { Environment } from '../app/models/core/environment.model';

export const APP_CONFIG: Environment = {
    production: true,
    environment: 'WEB-PROD',
    companyLogoPath: 'assets/icons/company-logos/company-logo-usina-tandil.png',
    standsQuantity: 8,
    generatorType: GeneratorEnum.Manual,
    patternType: PatternEnum.Virtual,
    skipSteps: {
        photocellAdjustmentRequest: false,
        verificationMajorStep: true,
        preparationMajorStep: true,
        vacuumTestRun: false,
        bootTestRun: false,
        contrastTestRun: false,
        integrationTestRun: false
    },
    virtualMachine: true,
    logsHistory: false,
    delays: {
        patternCheckCycleDelay: 50,
        resultsDelay: 50,
        loopDelay: 50
    }
};
