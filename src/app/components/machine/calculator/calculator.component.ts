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
  setActiveStandsAndTestType$(): Observable<ACK> {
    // TODO en caso de error cambiar el device status;
    return of();
  }
}
