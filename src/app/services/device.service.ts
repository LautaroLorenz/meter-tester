/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable } from '@angular/core';
import { from, Observable, Subject } from 'rxjs';
import { IpcService } from './ipc.service';

@Injectable({
  providedIn: 'root',
})
export class DeviceService {
  private readonly _onMachineToSoftware$: Subject<any[]>; // FIXME any[]

  constructor(private readonly ipcService: IpcService) {
    this._onMachineToSoftware$ = new Subject();
    this.observeUSB();
  }

  get handleMachineToSoftware$(): Subject<any[]> {
    return this._onMachineToSoftware$;
  }

  write(command: string): Observable<void> {
    return from(this.ipcService.invoke('software-write', { command }));
  }

  private observeUSB(): void {
    this.ipcService.on('on-data-usb', (...args: any[]) => {
      this._onMachineToSoftware$.next(args);
    });
  }
}
