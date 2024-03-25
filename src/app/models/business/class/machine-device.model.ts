import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { DeviceStatus } from '../enums/device-status.model';
import {
  BehaviorSubject,
  Observable,
  Subject,
  filter,
  from,
  map,
  takeUntil,
} from 'rxjs';
import { Devices } from '../enums/devices.model';
import { IpcService } from '../../../services/ipc.service';
import { MessagesService } from '../../../services/messages.service';
import { DeviceConstants } from '../constants/devices-constant.model';

@Component({
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export abstract class MachineDeviceComponent implements OnDestroy {
  deviceStatus$ = new BehaviorSubject<DeviceStatus>(DeviceStatus.Unknown);

  protected deviceStop = new Subject<void>();
  protected onDestroy = new Subject<void>();

  protected readonly DeviceConstants = DeviceConstants;

  abstract readonly device: Devices;

  constructor(
    protected readonly ipcService: IpcService,
    private readonly messagesService: MessagesService
  ) {}

  ngOnDestroy(): void {
    this.onDestroy.next();
    this.onDestroy.complete();
    this.deviceStop.complete();
  }

  write$(command: string): Observable<string> {
    return from(this.ipcService.invoke('software-write', { command })).pipe(
      takeUntil(this.onDestroy),
      takeUntil(this.deviceStop),
      filter(({ result, error }) => {
        if (error) {
          this.deviceStop.next();
          this.deviceStatus$.next(DeviceStatus.Error);
          this.messagesService.error(
            `Error de comunicación [${DeviceConstants[this.device]}]`
          );
          return false;
        }
        return !!result;
      }),
      map(({ result }) => result as string)
    );
  }
}
