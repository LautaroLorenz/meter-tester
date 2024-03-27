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
import { Observable, delay, merge, of } from 'rxjs';

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

  beforeEach(async () => {
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

  it('se puede enviar un comando y esperar la respuesta', (done) => {
    let counter = 0;
    spyOn(ipcService, 'invoke$').and.returnValue(
      of({ result: (counter++).toString() }).pipe(delay(250))
    );

    deviceOne.write$('command').subscribe((response) => {
      expect(response).toEqual('0');
      done();
    });
  });

  it('se puede encolar los comandos de salida cuando se llaman en paralelo', fakeAsync(() => {
    const responseDelay = 250;

    const spyInvoke$ = spyOn(ipcService, 'invoke$').and.callFake(
      <T = any>(_: string, ...args: any[]): Observable<T> => {
        const command: string = args[0].command;
        let response = '';
        switch (command) {
          case 'command1':
            response = 'respuesta command1';
            break;
          case 'command2':
            response = 'respuesta command2';
            break;
          case 'command3':
            response = 'respuesta command3';
            break;
          case 'command4':
            response = 'respuesta command4';
            break;
        }
        return of({ result: response }).pipe(
          delay(responseDelay)
        ) as Observable<T>;
      }
    );

    const spyDeviceWrite$ = spyOn(deviceService, 'write$').and.callThrough();

    // Spy para saber cuando llega la respuesta de un comando.
    const obj = { onMergeSubscribe: (_: string) => {} }; // eslint-disable-line @typescript-eslint/no-unused-vars
    const spyResponse = spyOn(obj, 'onMergeSubscribe').and.callThrough();

    // Emitimos todos los comandos al mismo tiempo (con merge)
    merge(
      deviceOne.write$('command1'), // comandos del device one
      deviceOne.write$('command2'),
      deviceTwo.write$('command3'), // comandos del device two
      deviceTwo.write$('command4')
    ).subscribe(obj.onMergeSubscribe);

    tick(1);

    // Comprobaremos que el operador merge realice todas las llamadas write$ en paralelo:
    // ----------------------------------------------------------------------------------
    expect(spyDeviceWrite$).toHaveBeenCalledTimes(4);
    expect(spyDeviceWrite$.calls.allArgs()).toEqual([
      ['command1'],
      ['command2'],
      ['command3'],
      ['command4'],
    ]);
    expect(spyInvoke$).toHaveBeenCalledTimes(4);
    expect(spyInvoke$.calls.allArgs()).toEqual([
      ['software-write', { command: 'command1' }],
      ['software-write', { command: 'command2' }],
      ['software-write', { command: 'command3' }],
      ['software-write', { command: 'command4' }],
    ]);

    // Comprobamos que las llamadas a invoke$ emiten respuestas secuencialmente
    // Esto sucederá porque deviceService.write$ encola las llamadas con concatMap
    // concatMap se subscribe al observable que retorna invoke$ a medida que se completa el anterior
    // ---------------------------------------------------------------------------------------------
    expect(spyResponse.calls.all().length).toEqual(0);

    tick(responseDelay);
    expect(spyResponse.calls.all().length).toEqual(1);
    expect(spyResponse.calls.mostRecent().args).toEqual(['respuesta command1']);

    tick(responseDelay);
    expect(spyResponse.calls.all().length).toEqual(2);
    expect(spyResponse.calls.mostRecent().args).toEqual(['respuesta command2']);

    tick(responseDelay);
    expect(spyResponse.calls.all().length).toEqual(3);
    expect(spyResponse.calls.mostRecent().args).toEqual(['respuesta command3']);

    tick(responseDelay);
    expect(spyResponse.calls.all().length).toEqual(4);
    expect(spyResponse.calls.mostRecent().args).toEqual(['respuesta command4']);
  }));

  // it('', fakeAsync(() => {
  //   // TODO
  // }));
});
