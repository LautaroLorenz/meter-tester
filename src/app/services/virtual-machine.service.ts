import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { IpcService } from './ipc.service';

@Injectable({
  providedIn: 'root',
})
export class VirtualMachineService {
  private readonly _onSoftwareToMachine$: Subject<string>;

  constructor(private readonly ipcService: IpcService) {
    this._onSoftwareToMachine$ = new Subject();
    this.observe();
  }

  get handleSoftwareToMachine$(): Subject<string> {
    return this._onSoftwareToMachine$;
  }

  write$(command: string): Observable<void> {
    return this.ipcService.invoke$('virtual-machine-write', {
      command,
    });
  }

  private observe(): void {
    this.ipcService.on('handle-software-write', (_: any, command: string) => {
      this._onSoftwareToMachine$.next(command);
    });
  }
}
