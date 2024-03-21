import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
} from '@angular/core';
import { DeviceStatus } from '../enums/device-status.model';
import { Observable, of, take } from 'rxjs';

@Component({
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MachineDeviceComponent implements OnInit {
  deviceStatus: DeviceStatus = DeviceStatus.Unknown;

  ngOnInit(): void {
    this.checkDeviceStatus$().pipe(take(1)).subscribe();
    this.afterSuperOnInit();
  }

  checkDeviceStatus$(): Observable<DeviceStatus> {
    // TODO en caso de error cambiar el device status;
    return of();
  }

  protected afterSuperOnInit(): void {}

  // TODO función para cambiar el device status en caso de error
  // protected 
}
