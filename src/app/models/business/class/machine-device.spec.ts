import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { Devices } from '../enums/devices.model';
import { MachineDeviceComponent } from './machine-device.model';
import { DeviceService } from '../../../services/device.service';
import { Component, ViewChild } from '@angular/core';
import { MessagesService } from '../../../services/messages.service';
import { IpcService } from '../../../services/ipc.service';
import { MessageService } from 'primeng/api';
import {
  BehaviorSubject,
  Subject,
  delay,
  merge,
  of,
  switchMap,
  takeUntil,
  takeWhile,
  tap,
} from 'rxjs';
import { DeviceStatus } from '../enums/device-status.model';
import { CommandDirector } from './command-director.model';

function buildCommand(to: Devices | string, action: string): string {
  return `${to}${CommandDirector.DIVIDER}${action}`;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function logTimeHelper(): string {
  const date = new Date();
  return `Time[${date.getSeconds()}.${date.getMilliseconds()}]`;
}

@Component({
  template: `Device One`,
  selector: 'app-device-one',
})
class DeviceOneComponent extends MachineDeviceComponent {
  override device = Devices.CAL;
}

@Component({
  template: `Device Two`,
  selector: 'app-device-two',
})
class DeviceTwoComponent extends MachineDeviceComponent {
  override device = Devices.PAT;
}

@Component({
  template: `
    <app-device-one #deviceOne></app-device-one>
    <app-device-two #deviceTwo></app-device-two>
  `,
})
class HostComponent {
  @ViewChild('deviceOne', { static: true })
  deviceOne!: DeviceOneComponent;
  @ViewChild('deviceTwo', { static: true })
  deviceTwo!: DeviceOneComponent;
}

describe('Machine Device', () => {
  let hostComponent: HostComponent;
  let hostFixture: ComponentFixture<HostComponent>;

  let deviceOne: DeviceOneComponent;
  let deviceTwo: DeviceTwoComponent;
  let ipcService: IpcService;
  let deviceService: DeviceService;
  const ipcRendererSpy = jasmine.createSpyObj('ipcRenderer', ['invoke']);
  const responseDelay = 250;

  // El loopDelay es menor que el responseDelay, de esa manera aseguramos que el software
  // intentará enviar un nuevo comando más rápido de lo que la máquina responde. La prueba es exaustiva
  // porque el softaware debe ser lo suficientemente robusto, como para que de alguna manera, no sobreexija
  // a la máquina. Lo que conseguimos descartando los intentos de envio cunado hay un comando de loop encolado.
  const loopDelay = responseDelay / 2;

  // Estas son las respuetas que emite ipcMain.invoke cuando la máquina responde un comando
  ipcRendererSpy.invoke.and.callFake((channel: string, ...args: any[]) => {
    if (channel !== 'software-write') {
      throw new Error('channel incorrecto');
    }
    const command: string = args[0].command;
    const to = command.split(CommandDirector.DIVIDER)[0];
    const action = command.split(CommandDirector.DIVIDER)[1];
    const response = {
      result: `response ${buildCommand(to, action)}`,
    };
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(response);
      }, responseDelay);
    });
  });

  const spyResponse = jasmine
    .createSpy('spyResponse')
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .and.callFake((..._args: any[]) => {});

  const spyCommandQueue = jasmine
    .createSpy('spyCommandQueue')
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .and.callFake((..._args: any[]) => {});

  beforeEach(async () => {
    window.require = () => ({ ipcRenderer: ipcRendererSpy });

    await TestBed.configureTestingModule({
      declarations: [HostComponent, DeviceOneComponent, DeviceTwoComponent],
      providers: [DeviceService, MessagesService, MessageService, IpcService],
    }).compileComponents();

    hostFixture = TestBed.createComponent(HostComponent);
    hostComponent = hostFixture.componentInstance;
    hostFixture.detectChanges();

    ipcService = TestBed.inject(IpcService);
    deviceService = TestBed.inject(DeviceService);
    deviceOne = hostComponent.deviceOne;
    deviceTwo = hostComponent.deviceTwo;
  });

  afterEach(() => {
    ipcRendererSpy.invoke.calls.reset();
    spyResponse.calls.reset();
    spyCommandQueue.calls.reset();
  });

  it('se puede enviar un comando y esperar la respuesta', (done) => {
    spyOn(ipcService, 'invoke$').and.returnValue(
      of({ result: 'commmand response' }).pipe(delay(250))
    );

    deviceOne.write$('command').subscribe((response) => {
      expect(response).toEqual('commmand response');
      done();
    });
  });

  it('se puede serializar el envio de comandos cuando se intentan enviar en paralelo', fakeAsync(() => {
    // Spy para saber como se emiten los comandos
    const spyIpcServiceInvoke$ = spyOn(ipcService, 'invoke$').and.callThrough();
    const spyDeviceWrite$ = spyOn(deviceService, 'write$').and.callThrough();

    const commands = {
      start: buildCommand(deviceOne.device, 'start'),
      result: buildCommand(deviceOne.device, 'result'),
      stop: buildCommand(deviceOne.device, 'stop'),
    };

    // Emitimos todos los comandos al mismo tiempo utilizando merge
    merge(
      deviceOne.write$(commands.start),
      deviceOne.write$(commands.result),
      deviceOne.write$(commands.stop)
    ).subscribe(spyResponse);

    // Comprobaremos que el operador merge realice todas las llamadas write$ en paralelo:
    // ----------------------------------------------------------------------------------
    // las llamadas pasan por la class MachineDevice método write$
    expect(spyDeviceWrite$).toHaveBeenCalledTimes(3);
    expect(spyDeviceWrite$.calls.allArgs()).toEqual([
      [commands.start],
      [commands.result],
      [commands.stop],
    ]);
    // las llamadas pasan por el servicio deviceService método write$, agregando el channel
    expect(spyIpcServiceInvoke$).toHaveBeenCalledTimes(3);
    expect(spyIpcServiceInvoke$.calls.allArgs()).toEqual([
      ['software-write', { command: commands.start }],
      ['software-write', { command: commands.result }],
      ['software-write', { command: commands.stop }],
    ]);

    // Comprobamos que gracias a que los comandos fueron encolados con el concatMap en deviceService
    // a ipcRenderer.invoke le llegaran de a uno en uno, a medida que invoke resuelva las respuestas
    // ---------------------------------------------------------------------------------------------

    expect(ipcRendererSpy.invoke.calls.all().length).toEqual(1);
    expect(ipcRendererSpy.invoke.calls.mostRecent().args[1].command).toEqual(
      commands.start
    );
    expect(spyResponse.calls.all().length).toEqual(0);
    // avanzamos el tiempo hasta que ipcRenderer.invoke resuelve la promesa con la respuesta del comando
    tick(responseDelay);
    expect(spyResponse.calls.all().length).toEqual(1);
    expect(spyResponse.calls.mostRecent().args).toEqual([
      `response ${commands.start}`,
    ]);

    // luego de respondido el primer comando, se procesa el segundo comando
    expect(ipcRendererSpy.invoke.calls.all().length).toEqual(2);
    expect(ipcRendererSpy.invoke.calls.mostRecent().args[1].command).toEqual(
      commands.result
    );
    tick(responseDelay);
    expect(spyResponse.calls.all().length).toEqual(2);
    expect(spyResponse.calls.mostRecent().args).toEqual([
      `response ${commands.result}`,
    ]);

    // luego de respondido el segundo comando, se procesa el tercer comando
    expect(ipcRendererSpy.invoke.calls.all().length).toEqual(3);
    expect(ipcRendererSpy.invoke.calls.mostRecent().args[1].command).toEqual(
      commands.stop
    );
    tick(responseDelay);
    expect(spyResponse.calls.all().length).toEqual(3);
    expect(spyResponse.calls.mostRecent().args).toEqual([
      `response ${commands.stop}`,
    ]);
  }));

  it('se puede serializar el envio de comandos en la secuencia ->start->result->stop', fakeAsync(() => {
    const commands = {
      start: buildCommand(deviceOne.device, 'start'),
      result: buildCommand(deviceOne.device, 'result'),
      stop: buildCommand(deviceOne.device, 'stop'),
    };

    // Hacemos un start y luego un stop
    deviceTwo
      .write$(commands.start)
      .pipe(
        tap(spyResponse),
        switchMap(() => deviceTwo.write$(commands.result)),
        tap(spyResponse),
        switchMap(() => deviceTwo.write$(commands.stop)),
        tap(spyResponse)
      )
      .subscribe();

    // Comprobaremos que los comandos se envian secuencialmente
    // --------------------------------------------------------
    expect(ipcRendererSpy.invoke.calls.all().length).toEqual(1);
    expect(ipcRendererSpy.invoke.calls.mostRecent().args[1].command).toEqual(
      commands.start
    );
    tick(responseDelay);
    expect(spyResponse.calls.all().length).toEqual(1);
    expect(spyResponse.calls.mostRecent().args).toEqual([
      `response ${commands.start}`,
    ]);
    expect(ipcRendererSpy.invoke.calls.all().length).toEqual(2);
    expect(ipcRendererSpy.invoke.calls.mostRecent().args[1].command).toEqual(
      commands.result
    );
    tick(responseDelay);
    expect(spyResponse.calls.all().length).toEqual(2);
    expect(spyResponse.calls.mostRecent().args).toEqual([
      `response ${commands.result}`,
    ]);
    expect(ipcRendererSpy.invoke.calls.all().length).toEqual(3);
    expect(ipcRendererSpy.invoke.calls.mostRecent().args[1].command).toEqual(
      commands.stop
    );
    tick(responseDelay);
    expect(spyResponse.calls.all().length).toEqual(3);
    expect(spyResponse.calls.mostRecent().args).toEqual([
      `response ${commands.stop}`,
    ]);
  }));

  it('se puede realizar un loop de envio de comandos', fakeAsync(() => {
    const commands = {
      start: buildCommand(deviceOne.device, 'start'),
      result: buildCommand(deviceOne.device, 'result'),
      stop: buildCommand(deviceOne.device, 'stop'),
    };

    // cola de comandos (solo lectura)
    deviceService.readQueueCommands$.pipe(tap(spyCommandQueue)).subscribe();

    // Generación del loop: start->[device status Working]->loopWrite(result)
    deviceOne
      .write$(commands.start)
      .pipe(
        tap(spyResponse),
        tap(() => deviceOne.deviceStatus$.next(DeviceStatus.Working)),
        switchMap(() =>
          deviceOne
            .loopWrite$(
              commands.result,
              loopDelay,
              () => deviceOne.deviceStatus$.value === DeviceStatus.Working
            )
            .pipe(tap(spyResponse))
        )
      )
      .subscribe();

    // Detención del loop: stop->[device status StopInProgress]->stop loop write->[device status Connected]
    setTimeout(() => {
      of(deviceOne.deviceStatus$.next(DeviceStatus.StopInProgress))
        .pipe(
          switchMap(() => deviceOne.write$(commands.stop)),
          tap(() => deviceOne.deviceStatus$.next(DeviceStatus.Connected))
        )
        .subscribe(spyResponse);
    }, responseDelay * 4);

    // Comprobamos la cola de comandos a medida que avanza el tiempo:
    // --------------------------------------------------------------

    // la cola de comandos tiene para procesar un start
    expect(spyCommandQueue.calls.mostRecent().args[0]).toEqual([
      commands.start,
    ]);
    // aún no llega ninguna respuesta
    expect(spyResponse.calls.all().length).toEqual(0);

    tick(responseDelay);
    // la cola de comandos queda vacia
    expect(spyCommandQueue.calls.mostRecent().args[0].length).toEqual(0);

    tick(responseDelay);
    // llega respuesta del comando anterior
    expect(spyResponse.calls.mostRecent().args[0]).toEqual(
      `response ${commands.start}`
    );
    // (Empieza loop) ingresa en cola un nuevo comando result
    expect(spyCommandQueue.calls.mostRecent().args[0]).toEqual([
      commands.result,
    ]);

    tick(responseDelay);
    // llega respuesta del comando anterior
    expect(spyResponse.calls.mostRecent().args[0]).toEqual(
      `response ${commands.result}`
    );
    // (Ciclo loop) ingresa en cola un nuevo comando result
    expect(spyCommandQueue.calls.mostRecent().args[0]).toEqual([
      commands.result,
    ]);

    tick(responseDelay);
    // llega respuesta del comando anterior
    expect(spyResponse.calls.mostRecent().args[0]).toEqual(
      `response ${commands.result}`
    );
    // Ingresa en cola un stop
    // (Ciclo loop) ingresa en cola un nuevo comando result
    expect(spyCommandQueue.calls.mostRecent().args[0]).toEqual([
      commands.stop,
      commands.result,
    ]);

    tick(responseDelay);
    // llega respuesta del comando anterior
    expect(spyResponse.calls.mostRecent().args[0]).toEqual(
      `response ${commands.result}`
    );
    // Se detuvo el loop, así que solo queda por procesar el stop
    expect(spyCommandQueue.calls.mostRecent().args[0]).toEqual([commands.stop]);

    tick(responseDelay);
    expect(spyResponse.calls.mostRecent().args[0]).toEqual(
      `response ${commands.stop}`
    );
    // la cola de comandos queda vacía
    expect(spyCommandQueue.calls.mostRecent().args[0].length).toEqual(0);

    // la cantidad de comandos enviados y respuestas recibidas coincide:
    expect(ipcRendererSpy.invoke.calls.all().length).toEqual(
      spyResponse.calls.all().length
    );
  }));

  // it('' => {
  // TODO probar más de un loop al mismo tiempo, para diferentes dispositivos
  // })

  // it('' => {
  // TODO probar que pasa con el deviceStatus y el write$ y el loopWrite$ si invoke da error
  // })

  // it('' => {
  // TODO probar la diferencia entre stop whileFn vs stop en el subcrive con takeUntil y takeWhile
  // })
});
