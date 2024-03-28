import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { DeviceStatus } from '../enums/device-status.model';
import {
  BehaviorSubject,
  Observable,
  Subject,
  exhaustMap,
  filter,
  interval,
  map,
  takeUntil,
  takeWhile,
  tap,
} from 'rxjs';
import { Devices } from '../enums/devices.model';
import { MessagesService } from '../../../services/messages.service';
import { DeviceConstants } from '../constants/devices-constant.model';
import { DeviceService } from '../../../services/device.service';
import { CommandDirector } from './command-director.model';

@Component({
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export abstract class MachineDeviceComponent implements OnDestroy {
  deviceStatus$ = new BehaviorSubject<DeviceStatus>(DeviceStatus.Unknown);

  protected deviceError = new Subject<void>();
  protected onDestroy = new Subject<void>();

  protected readonly DeviceConstants = DeviceConstants;

  abstract readonly device: Devices;

  constructor(
    private readonly deviceService: DeviceService,
    private readonly messagesService: MessagesService
  ) {}

  ngOnDestroy(): void {
    this.onDestroy.next();
    this.onDestroy.complete();
    this.deviceError.complete();
  }

  buildCommand(...blocks: string[]): string {
    return CommandDirector.build(Devices.STW, this.device, ...blocks);
  }

  write$(command: string): Observable<string> {
    return this.deviceService.write$(command).pipe(
      takeUntil(this.deviceError),
      takeUntil(this.onDestroy),
      filter(({ result, error }) => {
        if (error) {
          this.deviceError.next();
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

  loopWrite$(
    command: string,
    delay: number,
    whileFn: () => boolean // condición de parada
  ): Observable<string> {
    return interval(delay).pipe(
      // el takeWhile nos permite poner una condición de parada para el loop
      takeWhile(whileFn),
      takeUntil(this.deviceError),
      takeUntil(this.onDestroy),
      // Usamos exhaustMap para descartar nuevos llamados a write$ generados por el interval,
      // hasta que llegue la respuesta del write$ en curso.
      exhaustMap(() => this.write$(command))
    );
  }
}
