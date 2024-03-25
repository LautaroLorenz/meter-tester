import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MachineDeviceComponent } from '../../../models/business/class/machine-device.model';
import { Devices } from '../../../models/business/enums/devices.model';

@Component({
  selector: 'app-calculator',
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalculatorComponent extends MachineDeviceComponent {
  override readonly device = Devices.CAL;

  sendCommand(command: string): void {
    // TODO <!-- B| PCS| CAL| TSxxxxxx| xxxxxxxxxx| xxxxxxxx| P01xxxxx| P02xxxxx| P03xxxxx| P04xxxxx| P05xxxxx| Z| x -->
    this.write$(command).subscribe((response) => console.log(response));
  }
}
