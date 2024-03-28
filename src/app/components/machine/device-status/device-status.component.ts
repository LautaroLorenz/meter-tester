import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { DeviceStatus } from '../../../models/business/enums/device-status.model';

@Component({
  selector: 'app-device-status',
  templateUrl: './device-status.component.html',
  styleUrls: ['./device-status.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeviceStatusComponent {
  @Input() deviceStatus!: DeviceStatus;

  get severity(): 'success' | 'info' | 'warning' | 'danger' | null | undefined {
    switch (this.deviceStatus) {
      case DeviceStatus.Unknown:
        return null;
      case DeviceStatus.Connected:
        return 'info';
      case DeviceStatus.Working:
        return 'success';
      case DeviceStatus.Error:
        return 'danger';
      case DeviceStatus.StopInProgress:
        return null;
    }
  }

  get text(): string {
    switch (this.deviceStatus) {
      case DeviceStatus.Unknown:
        return 'Sin verificar';
      case DeviceStatus.Connected:
        return 'Conectado';
      case DeviceStatus.Working:
        return 'Trabajando';
      case DeviceStatus.Error:
        return 'Error';
      case DeviceStatus.StopInProgress:
        return 'Realizando stop';
    }
  }
}
