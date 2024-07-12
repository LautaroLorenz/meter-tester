import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-system-info-dialog',
  templateUrl: './system-info-dialog.component.html',
  styleUrls: ['./system-info-dialog.component.scss']
})
export class SystemInfoDialogComponent {
  @Input() display = false;
  @Output() displayChange = new EventEmitter<boolean>();

  systemInfo = {
    hardwareVersion: 'CE8p-v6',
    softwareVersion: '6.0.0'
  };

  onHide(): void {
    this.displayChange.emit(this.display);
  }
}
