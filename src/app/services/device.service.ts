/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable } from '@angular/core';
import { from, Observable, Subject } from 'rxjs';
import { IpcService } from './ipc.service';

@Injectable({
  providedIn: 'root',
})
export class DeviceService {
  private readonly _onMachineToSoftware$: Subject<string>;

  constructor(private readonly ipcService: IpcService) {
    this._onMachineToSoftware$ = new Subject();
    this.observeUSB();
  }

  get handleMachineToSoftware$(): Subject<string> {
    return this._onMachineToSoftware$;
  }

  write(command: string): Observable<void> {
    return from(this.ipcService.invoke('software-write', { command }));
  }

  private observeUSB(): void {
    this.ipcService.on('on-data-usb', (_: any, command: string) => {
      this._onMachineToSoftware$.next(command);
    });
  }
}
