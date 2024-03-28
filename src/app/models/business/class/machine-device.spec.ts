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
import { delay, merge, of, switchMap, tap } from 'rxjs';
import { DeviceStatus } from '../enums/device-status.model';

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

  // Estas son las respuetas que emite ipcMain.invoke cuando la máquina responde un comando
  ipcRendererSpy.invoke.and.callFake((channel: string, ...args: any[]) => {
    if (channel !== 'software-write') {
      throw new Error('channel incorrecto');
    }
    const command: string = args[0].command;
    const response = { result: '' };
    switch (command) {
      case 'start':
        response.result = 'response for start';
        break;
      case 'stop':
        response.result = 'response for stop';
        break;
      case 'result':
        response.result = 'response for result';
        break;
    }
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

    // Emitimos todos los comandos al mismo tiempo utilizando merge
    merge(
      deviceOne.write$('start'),
      deviceOne.write$('result'),
      deviceOne.write$('stop')
    ).subscribe(spyResponse);

    // Comprobaremos que el operador merge realice todas las llamadas write$ en paralelo:
    // ----------------------------------------------------------------------------------
    // las llamadas pasan por la class MachineDevice método write$
    expect(spyDeviceWrite$).toHaveBeenCalledTimes(3);
    expect(spyDeviceWrite$.calls.allArgs()).toEqual([
      ['start'],
      ['result'],
      ['stop'],
    ]);
    // las llamadas pasan por el servicio deviceService método write$, agregando el channel
    expect(spyIpcServiceInvoke$).toHaveBeenCalledTimes(3);
    expect(spyIpcServiceInvoke$.calls.allArgs()).toEqual([
      ['software-write', { command: 'start' }],
      ['software-write', { command: 'result' }],
      ['software-write', { command: 'stop' }],
    ]);

    // Comprobamos que gracias a que los comandos fueron encolados con el concatMap en deviceService
    // a ipcRenderer.invoke le llegaran de a uno en uno, a medida que invoke resuelva las respuestas
    // ---------------------------------------------------------------------------------------------

    expect(ipcRendererSpy.invoke.calls.all().length).toEqual(1);
    expect(ipcRendererSpy.invoke.calls.mostRecent().args[1].command).toEqual(
      'start'
    );
    expect(spyResponse.calls.all().length).toEqual(0);
    // avanzamos el tiempo hasta que ipcRenderer.invoke resuelve la promesa con la respuesta del comando
    tick(responseDelay);
    expect(spyResponse.calls.all().length).toEqual(1);
    expect(spyResponse.calls.mostRecent().args).toEqual(['response for start']);

    // luego de respondido el primer comando, se procesa el segundo comando
    expect(ipcRendererSpy.invoke.calls.all().length).toEqual(2);
    expect(ipcRendererSpy.invoke.calls.mostRecent().args[1].command).toEqual(
      'result'
    );
    tick(responseDelay);
    expect(spyResponse.calls.all().length).toEqual(2);
    expect(spyResponse.calls.mostRecent().args).toEqual([
      'response for result',
    ]);

    // luego de respondido el segundo comando, se procesa el tercer comando
    expect(ipcRendererSpy.invoke.calls.all().length).toEqual(3);
    expect(ipcRendererSpy.invoke.calls.mostRecent().args[1].command).toEqual(
      'stop'
    );
    tick(responseDelay);
    expect(spyResponse.calls.all().length).toEqual(3);
    expect(spyResponse.calls.mostRecent().args).toEqual(['response for stop']);
  }));

  it('se puede serializar el envio de comandos en la secuencia ->start->result->stop', fakeAsync(() => {
    // Hacemos un start y luego un stop
    deviceTwo
      .write$('start')
      .pipe(
        tap(spyResponse),
        switchMap(() => deviceTwo.write$('result')),
        tap(spyResponse),
        switchMap(() => deviceTwo.write$('stop')),
        tap(spyResponse)
      )
      .subscribe();

    // Comprobaremos que los comandos se envian secuencialmente
    // --------------------------------------------------------
    expect(ipcRendererSpy.invoke.calls.all().length).toEqual(1);
    expect(ipcRendererSpy.invoke.calls.mostRecent().args[1].command).toEqual(
      'start'
    );
    tick(responseDelay);
    expect(spyResponse.calls.all().length).toEqual(1);
    expect(spyResponse.calls.mostRecent().args).toEqual(['response for start']);
    expect(ipcRendererSpy.invoke.calls.all().length).toEqual(2);
    expect(ipcRendererSpy.invoke.calls.mostRecent().args[1].command).toEqual(
      'result'
    );
    tick(responseDelay);
    expect(spyResponse.calls.all().length).toEqual(2);
    expect(spyResponse.calls.mostRecent().args).toEqual([
      'response for result',
    ]);
    expect(ipcRendererSpy.invoke.calls.all().length).toEqual(3);
    expect(ipcRendererSpy.invoke.calls.mostRecent().args[1].command).toEqual(
      'stop'
    );
    tick(responseDelay);
    expect(spyResponse.calls.all().length).toEqual(3);
    expect(spyResponse.calls.mostRecent().args).toEqual(['response for stop']);
  }));

  // TODO emprolijar y agregar los expect, test envio de comandos en loop
  fit('test loopWrite', fakeAsync(() => {
    let counter = 0;
    const commandGenerator = () => {
      console.log(logTimeHelper(), 'generate command', counter);
      counter++;
      return 'result';
    };

    // TODO detiene el loop porque se deja de cumplir la while condition
    setTimeout(() => {
      deviceOne
        .write$('stop')
        .pipe(tap(() => deviceOne.deviceStatus$.next(DeviceStatus.Connected)))
        .pipe(tap((response) => console.log(response)))
        .subscribe(spyResponse);
    }, 2000);

    deviceOne
      .write$('start')
      .pipe(
        tap(spyResponse),
        tap((response) => console.log(response)),
        tap(() => deviceOne.deviceStatus$.next(DeviceStatus.Working)),
        switchMap(() =>
          deviceOne
            .loopWrite$(
              commandGenerator,
              // el delay tiene que ser el responseDelay / 2, de esa forma aseguramos que el código funciona
              // es decir, que se hacen mas envios de comandos de los que la máquina puede procesar
              // y que aún asi el software espera a que la máquina responda, no la sobreecarga de envios.
              100,
              () => deviceOne.deviceStatus$.value === DeviceStatus.Working
            )
            .pipe(tap(spyResponse))
        )
      )
      .subscribe((response) => console.log('loop response', response));

    // TODO hacer un loop que se detenga por un stop$ Subject en el padre, que no tenga relacion con la whileFn

    // TODO
    tick(10000);
    console.log(
      `comandos enviados ${ipcRendererSpy.invoke.calls.all().length as string}`
    );
    console.log(`comandos respondidos ${spyResponse.calls.all().length}`);
  }));

  // it('' => {
  // TODO probar más de un loop al mismo tiempo, para diferentes dispositivos
  // })

  // it('' => {
  // TODO probar que pasa con el deviceStatus y el write$ y el loopWrite$ si invoke da error
  // })
});
