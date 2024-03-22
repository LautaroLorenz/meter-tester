import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { IpcService } from './ipc.service';

@Injectable({
  providedIn: 'root',
})
export class VirtualMachineService {
  private readonly _onSoftwareToMachine$: Subject<any[]>; // FIXME any[]

  constructor(private readonly ipcService: IpcService) {
    this._onSoftwareToMachine$ = new Subject();
    this.observe();
  }

  get handleSoftwareToMachine$(): Subject<any[]> {
    return this._onSoftwareToMachine$;
  }

  private observe(): void {
    console.log('register observe');
    this.ipcService.on('handle-software-write', (...args: any[]) => {
      console.log('handle-software-write', args);
      this._onSoftwareToMachine$.next(args);
    });
  }
}
