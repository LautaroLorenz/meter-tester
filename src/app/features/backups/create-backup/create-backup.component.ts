import { BlockUIService } from './../../../services/block-ui.service';
import { Observable, tap, filter, switchMap, map, of, finalize } from 'rxjs';
import { MessagesService } from './../../../services/messages.service';
import { BackupService } from './../../../services/backup.service';
import { Component, OnInit } from '@angular/core';
import { PageUrlName } from '../../../models/business/enums/page-name.model';
import { Backup } from '../../../models/business/database/backup.model';
import { Message } from 'primeng/api';

@Component({
  templateUrl: './create-backup.component.html',
  styleUrls: ['./create-backup.component.scss']
})
export class CreateBackupComponent implements OnInit {
  readonly title = 'Crear backup';
  readonly PageUrlName = PageUrlName;

  lastCreatedBackup: Backup | undefined;
  backupWarningMessages: Message[] = [];

  constructor(
    private blockUIService: BlockUIService,
    private messagesService: MessagesService,
    private backupService: BackupService
  ) { }

  ngOnInit(): void {
    // verificar la fecha en que se creó el último backup
    this.backupService.checkLastBackup().subscribe((backupStatus) => {
      this.lastCreatedBackup = backupStatus.backup;
      this.backupWarningMessages = backupStatus.warningMessages;
    });
  }

  createBackup(): void {
    this.blockUIService.setBlocked(true);
    this.selectBackupFolder().pipe(
      tap((backupFolder) => {
        if (!backupFolder) {
          this.messagesService.warn('No se pudo crear el backup');
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
          this.backupService.checkLastBackup().subscribe((backupStatus) => {
            this.lastCreatedBackup = backupStatus.backup;
            this.backupWarningMessages = backupStatus.warningMessages;
          });
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
}
