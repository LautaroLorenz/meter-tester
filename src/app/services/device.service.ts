/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { IpcService } from './ipc.service';

@Injectable({
  providedIn: 'root',
})
export class DeviceService {
  constructor(private readonly ipcService: IpcService) {}

  write$(command: string): Observable<string> {
    return from(this.ipcService.invoke('software-write', { command }));
  }
}
