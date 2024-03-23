import { Pipe, PipeTransform } from '@angular/core';
import {} from '../../models/business/constants/meter-constant.model';
import { Devices } from '../../models/business/enums/devices.model';
import { DeviceConstants } from '../../models/business/constants/devices-constant.model';

@Pipe({
  name: 'deviceConstant',
})
export class DeviceConstantPipe implements PipeTransform {
  readonly DeviceConstants = DeviceConstants;

  transform(value: Devices): string {
    return DeviceConstants[value] as string;
  }
}
