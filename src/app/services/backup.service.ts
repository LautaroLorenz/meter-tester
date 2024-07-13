import { Observable } from 'rxjs';
import { Injectable, NgZone } from '@angular/core';
import { DeviceConstantPipe } from '../pipes/business/device.pipe';
import { DatePipe } from '@angular/common';
import { IpcService } from './ipc.service';

@Injectable({
    providedIn: 'root'
})
export class BackupService {

    constructor(
        private readonly datePipe: DatePipe,
        private readonly deviceConstantPipe: DeviceConstantPipe,
        private readonly ipcService: IpcService,
        private readonly ngZone: NgZone
    ) { }

    selectBackupFolder(): Observable<string | null> {
        return this.ipcService.invoke$('select-backup-folder');
    }

    createBackup(backupPath: string): Observable<{ success: boolean; message: string }> {
        return this.ipcService.invoke$('backup-database', backupPath);
    }
}
