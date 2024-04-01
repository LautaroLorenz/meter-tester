import { Pipe, PipeTransform } from '@angular/core';
import {
  MeterConstant,
  MeterConstantEnum,
  MeterConstants,
} from '../../models/business/constants/meter-constant.model';

/**
 * @return MeterConstantEnum como 'Activa' o 'Reactiva'
 */
@Pipe({
  name: 'meterConstant',
})
export class MeterConstantPipe implements PipeTransform {
  readonly MeterConstants = MeterConstants;

  transform(value: MeterConstant | MeterConstantEnum): string {
    if (typeof value === 'object' && 'name' in value) {
      return value.name;
    }

    return MeterConstants[value].name;
  }
}
