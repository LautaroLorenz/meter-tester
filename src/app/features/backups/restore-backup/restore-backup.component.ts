import { tap, finalize } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { PageUrlName } from '../../../models/business/enums/page-name.model';
import { Message, ConfirmationService, PrimeIcons } from 'primeng/api';
import { Backup } from '../../../models/business/database/backup.model';
import { BlockUIService } from '../../../services/block-ui.service';
import { MessagesService } from '../../../services/messages.service';
import { BackupService } from '../../../services/backup.service';

@Component({
  templateUrl: './restore-backup.component.html',
  styleUrls: ['./restore-backup.component.scss']
})
export class RestoreBackupComponent implements OnInit {
  readonly title = 'Restaurar base de datos';
  readonly PageUrlName = PageUrlName;

  lastCreatedBackup: Backup | undefined;
  backupWarningMessages: Message[] = [];

  constructor(
    private blockUIService: BlockUIService,
    private messagesService: MessagesService,
    private backupService: BackupService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit(): void {
    // verificar la fecha en que se creó el último backup
    this.backupService.checkLastBackup().subscribe((backupStatus) => {
      this.lastCreatedBackup = backupStatus.backup;
      this.backupWarningMessages = backupStatus.warningMessages;
    });
  }

  restoreBackupConfirmation(): void {
    this.confirmationService.confirm({
      message: '<p>Al restaurar la base de datos la información volverá al estado en que fue creado el backup que seleccione a continuación.</p><p><b>Esta operación no se puede deshacer.</b></p>',
      header: 'Restaurar base de datos',
      icon: PrimeIcons.EXCLAMATION_TRIANGLE,
      defaultFocus: 'reject',
      acceptButtonStyleClass: 'p-button-warning',
      acceptLabel: 'Continuar',
      accept: () => {
        this.restoreBackup();
      }
    });
  }

  private restoreBackup(): void {
    this.blockUIService.setBlocked(true);
    this.backupService.restoreBackup().pipe(
      tap(({ success }) => {
        if (success) {
          // verificar la fecha en que se creó el último backup
          this.backupService.checkLastBackup().subscribe((backupStatus) => {
            this.lastCreatedBackup = backupStatus.backup;
            this.backupWarningMessages = backupStatus.warningMessages;
          });
          this.messagesService.success('Base de datos restaurada', 10000);
        } else {
          this.messagesService.error('No se pudo resturar la base de datos');
        }
      }),
      finalize(() => this.blockUIService.setBlocked(false)),
    ).subscribe();
  }
}
