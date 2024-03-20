import { Pipe, PipeTransform } from '@angular/core';
import {
  MeterConstant,
  MeterConstants,
} from '../../models/business/constants/meter-constant.model';

@Pipe({
  name: 'meterConstant',
})
export class MeterConstantPipe implements PipeTransform {
  readonly MeterConstants = MeterConstants;

  transform(value: MeterConstant | number): string {
    if (typeof value === 'object' && 'name' in value) {
      return value.name as string;
    }

    return MeterConstants[value].name as string;
  }
}
