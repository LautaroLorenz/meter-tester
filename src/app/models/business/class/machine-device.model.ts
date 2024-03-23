import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { DeviceStatus } from '../enums/device-status.model';
import { Observable, Subject, of, take, takeUntil } from 'rxjs';
import { DeviceService } from '../../../services/device.service';

@Component({
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MachineDeviceComponent implements OnInit, OnDestroy {
  deviceStatus: DeviceStatus = DeviceStatus.Unknown;

  private onDestroy = new Subject<void>();

  constructor(protected readonly deviceService: DeviceService) {}

  ngOnInit(): void {
    this.checkDeviceStatus$().pipe(take(1)).subscribe();
    this.observeMachine();
    this.afterSuperOnInit();
  }

  ngOnDestroy(): void {
    this.onDestroy.next();
    this.onDestroy.complete();
  }

  checkDeviceStatus$(): Observable<DeviceStatus> {
    // TODO en caso de error cambiar el device status;
    return of();
  }

  protected afterSuperOnInit(): void {}

  // TODO función para cambiar el device status en caso de error
  // protected

  private observeMachine(): void {
    this.deviceService.handleMachineToSoftware$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((command) => {
        console.log(`software read [${command}]`);
      });
  }
}
