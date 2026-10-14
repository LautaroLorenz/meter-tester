import { GeneratorEnum } from '../app/models/business/enums/generator-enum.model';
import { PatternEnum } from '../app/models/business/enums/pattern-enum.model';
import { ClientConfig } from '../app/models/core/environment.model';

// Chaco - Secheep (sin logo: el reporte PDF muestra el nombre de la empresa)
export const CLIENT: ClientConfig = {
    companyName: 'Secheep',
    companyLogoPath: '',
    standsQuantity: 3,
    generatorType: GeneratorEnum.Manual,
    patternType: PatternEnum.Physical
};
