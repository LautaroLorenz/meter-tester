/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IpcService } from './ipc.service';

@Injectable({
    providedIn: 'root'
})
export class RestartService {
    constructor(
        private readonly ipcService: IpcService
    ) { }

    restartApp(): Observable<void> {
        return this.ipcService.invoke$('restart-app');
    }
}
