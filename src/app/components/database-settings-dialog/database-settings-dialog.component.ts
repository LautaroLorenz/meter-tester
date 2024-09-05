import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-database-settings-dialog',
  templateUrl: './database-settings-dialog.component.html',
  styleUrls: ['./database-settings-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatabaseSettingsDialogComponent {
  @Input() display = false;
  @Output() displayChange = new EventEmitter<boolean>();

  onHide(): void {
    this.displayChange.emit(this.display);
  }

  changeDataBaseConnection(): void {
    // TODO
  }
}
