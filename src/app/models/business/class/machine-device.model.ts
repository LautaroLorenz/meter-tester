import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { DeviceStatus } from '../enums/device-status.model';
import { Subject } from 'rxjs';
import { DeviceService } from '../../../services/device.service';
import { Devices } from '../enums/devices.model';

@Component({
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export abstract class MachineDeviceComponent implements OnDestroy {
  deviceStatus: DeviceStatus = DeviceStatus.Unknown;

  protected onDestroy = new Subject<void>();

  abstract readonly device: Devices;

  constructor(protected readonly deviceService: DeviceService) {}

  ngOnDestroy(): void {
    this.onDestroy.next();
    this.onDestroy.complete();
  }

  protected afterSuperOnInit(): void {}
}
