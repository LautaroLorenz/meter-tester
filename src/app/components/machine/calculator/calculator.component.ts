import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MachineDeviceComponent } from '../../../models/business/class/machine-device.model';
import { Devices } from '../../../models/business/enums/devices.model';
import { CommandDirector } from '../../../models/business/class/command-director.model';
import { SoftwareCalculatorCommands } from '../../../models/business/enums/commands.model';
import { Observable, tap } from 'rxjs';
import { DeviceStatus } from '../../../models/business/enums/device-status.model';

@Component({
  selector: 'app-calculator',
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalculatorComponent extends MachineDeviceComponent {
  override readonly device = Devices.CAL;

  stop$(): Observable<string> {
    const from = Devices.STW;
    const to = this.device;
    const command = CommandDirector.build(
      from,
      to,
      SoftwareCalculatorCommands.STOP
    );
    return this.write$(command).pipe(
      tap(() => this.deviceStatus$.next(DeviceStatus.Connected))
    );
  }

  start$(commandType: SoftwareCalculatorCommands): Observable<string> {
    const from = Devices.STW;
    const to = this.device;
    const command = CommandDirector.build(from, to, commandType);
    return this.write$(command).pipe(
      tap(() => this.deviceStatus$.next(DeviceStatus.Working))
    );
  }
}
