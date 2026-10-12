import { GeneratorEnum } from '../app/models/business/enums/generator-enum.model';
import { PatternEnum } from '../app/models/business/enums/pattern-enum.model';
import { ClientConfig } from '../app/models/core/environment.model';

// Usina Tandil
export const CLIENT: ClientConfig = {
    companyLogoPath: 'assets/icons/company-logos/company-logo-usina-tandil.png',
    standsQuantity: 6,
    generatorType: GeneratorEnum.Manual,
    patternType: PatternEnum.Virtual
};
