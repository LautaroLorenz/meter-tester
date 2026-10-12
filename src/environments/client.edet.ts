import { GeneratorEnum } from '../app/models/business/enums/generator-enum.model';
import { PatternEnum } from '../app/models/business/enums/pattern-enum.model';
import { ClientConfig } from '../app/models/core/environment.model';

// EDET - Tucumán
export const CLIENT: ClientConfig = {
    companyLogoPath: 'assets/icons/company-logos/company-logo-edet.png',
    standsQuantity: 20,
    generatorType: GeneratorEnum.SemiautomaticPYC5050,
    patternType: PatternEnum.Sm5050
};
