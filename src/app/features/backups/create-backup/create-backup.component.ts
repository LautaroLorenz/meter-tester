import { BlockUIService } from './../../../services/block-ui.service';
import { Observable, tap, filter, switchMap, map, of, finalize } from 'rxjs';
import { MessagesService } from './../../../services/messages.service';
import { BackupService } from './../../../services/backup.service';
import { Component } from '@angular/core';
import { PageUrlName } from '../../../models/business/enums/page-name.model';

@Component({
  templateUrl: './create-backup.component.html',
  styleUrls: ['./create-backup.component.scss']
})
export class CreateBackupComponent {
  readonly title = 'Crear backup';
  readonly PageUrlName = PageUrlName;

  lastCreatedBackup: string | undefined;

  constructor(
    private blockUIService: BlockUIService,
    private messagesService: MessagesService,
    private backupService: BackupService
  ) { }

  // si nunca creó un backup mostrar una advertencia en rojo.
  get hasLastBackupCreated(): boolean {
    return false;
  }

  // si el último backup fue hace más de 1 mes, mostrar una advertencia en naranja.
  get isLastBackupOutdated(): boolean {
    return false;
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
          // TODO actualizar fecha
          this.messagesService.success('Backup creado correctamente');
        } else {
          this.messagesService.error('No se pudo crear el backup');
        }
      }),
      finalize(() => this.blockUIService.setBlocked(false)),
    ).subscribe();
  }

  private selectBackupFolder(): Observable<string | null> {
    this.messagesService.info('Seleccionar carpeta para guardar el backup', false);
    return this.backupService.selectBackupFolder();
  }
}
