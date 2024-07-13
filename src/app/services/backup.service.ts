import { Observable, map } from 'rxjs';
import { Injectable } from '@angular/core';
import { IpcService } from './ipc.service';
import { Message } from 'primeng/api';
import { Backup, BackupDbTableContext } from '../models/business/database/backup.model';
import { DatabaseService } from './database.service';

@Injectable({
    providedIn: 'root'
})
export class BackupService {

    constructor(
        private readonly ipcService: IpcService,
        private readonly dbService: DatabaseService<Backup>
    ) { }

    selectBackupFolder(): Observable<string | null> {
        return this.ipcService.invoke$('select-backup-folder');
    }

    createBackup(backupPath: string): Observable<{ success: boolean; message: string }> {
        return this.ipcService.invoke$('backup-database', backupPath);
    }

    checkLastBackup(): Observable<{ warningMessages: Message[], backup: Backup | undefined }> {
        // traer el último registro de la tabla
        return this.dbService.getTable$(BackupDbTableContext.tableName, {
            relations: BackupDbTableContext.foreignTables,
            lazyLoadEvent: { rows: 1 }
        }).pipe(
            map(({ rows }) => {
                let warningMessages: Message[] = [];
                if (rows.length === 0) {
                    warningMessages = warningMessages.concat({
                        severity: 'warn',
                        summary: 'Aún no has creado un backup de tu base de datos',
                        detail: 'Crea un backup y resguardalo en un lugar seguro de tu preferencia'
                    });
                    return {
                        warningMessages,
                        backup: undefined,
                    };
                }
                const [backup] = rows;
                const lastCreatedBackupSavedTime = new Date(backup.saved_time);
                const isLastBackupOutdated = this.isBackupMoreThanOneMonthOld(lastCreatedBackupSavedTime);
                if (isLastBackupOutdated) {
                    warningMessages = warningMessages.concat({
                        severity: 'warn',
                        summary: 'Tu último backup es muy viejo',
                        detail: 'Se recomienda crear un nuevo backup'
                    });
                }
                return {
                    warningMessages,
                    backup
                };
            })
        );
    }

    private isBackupMoreThanOneMonthOld(dateToCheck: Date): boolean {
        const now = new Date();
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(now.getMonth() - 1);
        return dateToCheck < oneMonthAgo;
    }
}
