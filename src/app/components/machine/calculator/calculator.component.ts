import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MachineDeviceComponent } from '../../../models/business/class/machine-device.model';
import { Observable, of } from 'rxjs';
import { ACK } from '../../../models/business/types/device-ack.model';

@Component({
  selector: 'app-calculator',
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalculatorComponent extends MachineDeviceComponent {
  // TODO por output emite los resultados

  setActiveStandsAndTestType$(): Observable<ACK> {
    // TODO en caso de error cambiar el device status;
    // TODO mientras esta en status "working" seporta por output los resultados leidos;
    return of();
  }

  // FIXME
  softwareWrite(command: string): void {
    void this.deviceService.softwareWrite(command);
  }

  // TODO en caso de onDestroy apagar se puede hacer en MachineDeviceComponent.
}
