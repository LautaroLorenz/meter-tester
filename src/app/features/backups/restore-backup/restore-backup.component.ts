import { Component, OnInit } from '@angular/core';
import { PageUrlName } from '../../../models/business/enums/page-name.model';
import { Message } from 'primeng/api';
import { Backup } from '../../../models/business/database/backup.model';
import { BlockUIService } from '../../../services/block-ui.service';
import { MessagesService } from '../../../services/messages.service';
import { BackupService } from '../../../services/backup.service';

@Component({
  templateUrl: './restore-backup.component.html',
  styleUrls: ['./restore-backup.component.scss']
})
export class RestoreBackupComponent implements OnInit {
  readonly title = 'Restaurar backup';
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

  restoreBackup(): void {
    // TODO
  }
}
