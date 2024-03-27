import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { DeviceStatus } from '../enums/device-status.model';
import {
  BehaviorSubject,
  Observable,
  Subject,
  filter,
  map,
  takeUntil,
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

  // TODO
  // implementar unit test para MachineDevice
  // caso de uso
  // difentes dispositivos hacen start, stop y tienen un loop
  // cada dispositivo dispone de un único bus por el que pueden emitir los comandos.
  // el start y el stop se deben emitir y esperar la respuesta.
  // en el loop, si hay un llamado sin respuesta, el siguiente llamado no debe realizarse (recursividad)
  // border case, hacer start, iniciar el loop, sin finalizar el loop hacer stop
  // en este caso se debe respetar el ultimo ciclo del loop y luego ejecutar el stop en lugar de otor ciclo del loop
  // es decir el stop elimina todos los llamados de request que se hayan encolado mientras se estaba la respuesta del stop.
  // un posible método "clear device queue"
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
}
