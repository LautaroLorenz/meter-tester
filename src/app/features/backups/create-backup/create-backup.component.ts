import { BlockUIService } from './../../../services/block-ui.service';
import { Observable, tap, filter, switchMap, map, of, finalize } from 'rxjs';
import { MessagesService } from './../../../services/messages.service';
import { BackupService } from './../../../services/backup.service';
import { Component, OnInit } from '@angular/core';
import { PageUrlName } from '../../../models/business/enums/page-name.model';
import { DatabaseService } from '../../../services/database.service';
import { Backup, BackupDbTableContext } from '../../../models/business/database/backup.model';
import { Message } from 'primeng/api';

@Component({
  templateUrl: './create-backup.component.html',
  styleUrls: ['./create-backup.component.scss']
})
export class CreateBackupComponent implements OnInit {
  readonly title = 'Crear backup';
  readonly PageUrlName = PageUrlName;

  lastCreatedBackup: Backup | undefined;
  backupMessages: Message[] = [];

  constructor(
    private blockUIService: BlockUIService,
    private messagesService: MessagesService,
    private backupService: BackupService,
    private dbService: DatabaseService<Backup>
  ) { }

  ngOnInit(): void {
    // verificar la fecha en que se creó el último backup
    this.checkLastBackupCreatedDate();
  }

  createBackup(): void {
    this.blockUIService.setBlocked(true);
    this.selectBackupFolder().pipe(
      tap((backupFolder) => {
        if (!backupFolder) {
          this.messagesService.warn('No se pudo crear el backup');
          this.blockUIService.setBlocked(false);
        }
      }),
      filter((backupFolder) => !!backupFolder),
      switchMap((backupFolder) => {
        if (!backupFolder) {
          return of(false)
        }
        return this.backupService.createBackup(backupFolder).pipe(map(({ success }) => success))
      }),
      tap((backupCreated: boolean) => {
        if (backupCreated) {
          this.checkLastBackupCreatedDate();
          this.messagesService.success('Backup creado correctamente');
          this.messagesService.info('Recuerda poner el archivo de backup en un lugar seguro', true);
        } else {
          this.messagesService.error('No se pudo crear el backup');
        }
      }),
      finalize(() => this.blockUIService.setBlocked(false)),
    ).subscribe();
  }

  private selectBackupFolder(): Observable<string | null> {
    return this.backupService.selectBackupFolder();
  }

  private checkLastBackupCreatedDate(): void {
    // limpiar mensajes anteriores
    this.backupMessages = [];
    // traer el último registro de la tabla
    this.dbService.getTable$(BackupDbTableContext.tableName, {
      relations: BackupDbTableContext.foreignTables,
      lazyLoadEvent: { rows: 1 }
    }).subscribe(({ rows }) => {
      if (rows.length === 0) {
        this.backupMessages = this.backupMessages.concat({
          severity: 'warn',
          summary: 'Aún no has creado un backup de tu base de datos',
          detail: 'Crea un backup y resguardalo en un lugar seguro de tu preferencia'
        });
        return;
      }
      const [backupInfo] = rows;
      this.lastCreatedBackup = backupInfo;
      const lastCreatedBackupSavedTime = new Date(backupInfo.saved_time);
      const isLastBackupOutdated = this.isBackupMoreThanOneMonthOld(lastCreatedBackupSavedTime);
      if (isLastBackupOutdated) {
        this.backupMessages = this.backupMessages.concat({
          severity: 'warn',
          summary: 'Tu último backup es muy viejo',
          detail: 'Se recomienda crear un nuevo backup'
        });
      }
    });
  }

  private isBackupMoreThanOneMonthOld(dateToCheck: Date): boolean {
    const now = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(now.getMonth() - 1);
    return dateToCheck < oneMonthAgo;
  }
}
