import { RestartService } from './../../services/restart.service';
import { tap, finalize } from 'rxjs';
import { DatabaseService } from './../../services/database.service';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MessagesService } from '../../services/messages.service';
import { BlockUIService } from '../../services/block-ui.service';
import { ConfirmationService, PrimeIcons } from 'primeng/api';


@Component({
  selector: 'app-database-settings-dialog',
  templateUrl: './database-settings-dialog.component.html',
  styleUrls: ['./database-settings-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatabaseSettingsDialogComponent implements OnInit {
  @Input() display = false;
  @Output() displayChange = new EventEmitter<boolean>();

  dataBaseInfo: {
    customPath: string | undefined,
  } = {
      customPath: undefined,
    };

  constructor(
    private blockUIService: BlockUIService,
    private databaseService: DatabaseService<any>,
    private messagesService: MessagesService,
    private confirmationService: ConfirmationService,
    private restartService: RestartService,
  ) { }

  ngOnInit(): void {
    this.checkDataBaseCustomPath();
  }

  onHide(): void {
    this.displayChange.emit(this.display);
  }

  changeDataBaseConnection(): void {
    this.blockUIService.setBlocked(true);
    this.databaseService.changeConnectionPath().pipe(
      tap(({ success, message }) => {
        if (success) {
          this.messagesService.success('Conexión con la base de datos modificada');
          this.confirmationService.confirm({
            message: 'Para aplicar los cambios es necesario reiniciar.<br/>Si la aplicación no se inicia luego de 10 segundos, deberas iniciarla nuevamente de forma manual.',
            header: 'Reiniciar aplicación',
            icon: PrimeIcons.EXCLAMATION_TRIANGLE,
            defaultFocus: 'accept',
            acceptButtonStyleClass: 'p-button-success',
            acceptLabel: 'Reiniciar',
            accept: () => {
              this.restartService.restartApp().subscribe();
            },
            rejectVisible: false,
            closeOnEscape: false
          });
        } else if (message) {
          this.messagesService.error(message);
          this.blockUIService.setBlocked(false);
        }
      }),
      finalize(() => {
        this.display = false;
        this.onHide();
      })
    ).subscribe()
  }

  private checkDataBaseCustomPath(): void {
    this.databaseService.checkCustomConnectionPath().pipe(
      tap((customConnectionPath) => {
        if (customConnectionPath) {
          this.dataBaseInfo.customPath = customConnectionPath;
        }
      })
    ).subscribe();
  }
}
