import { Injectable } from '@angular/core';
import { from, Observable, Subject } from 'rxjs';
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

  write(command: string): Observable<void> {
    return from(
      this.ipcService.invoke('virtual-machine-write', {
        command,
      }) as Promise<void>
    );
  }

  private observe(): void {
    this.ipcService.on('handle-software-write', (...args: any[]) => {
      this._onSoftwareToMachine$.next(args);
    });
  }
}
