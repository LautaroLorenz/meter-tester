import { GeneratorEnum } from '../app/models/business/enums/generator-enum.model';
import { PatternEnum } from '../app/models/business/enums/pattern-enum.model';
import { ClientConfig } from '../app/models/core/environment.model';

// EDELAP - La Plata
export const CLIENT: ClientConfig = {
    companyName: 'EDELAP',
    companyLogoPath: 'assets/icons/company-logos/company-logo-edelap.png',
    standsQuantity: 8,
    generatorType: GeneratorEnum.Manual,
    patternType: PatternEnum.Physical
};
