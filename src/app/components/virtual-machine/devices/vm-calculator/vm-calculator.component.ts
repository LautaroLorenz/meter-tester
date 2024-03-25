import { ChangeDetectionStrategy, Component, forwardRef } from '@angular/core';
import { VMDeviceComponent } from '../../../../models/business/class/virtual-machine-device.model';
import { Devices } from '../../../../models/business/enums/devices.model';
import { CalculatorCommands } from '../../../../models/business/enums/commands.model';

@Component({
  selector: 'app-vm-calculator',
  templateUrl: './vm-calculator.component.html',
  styleUrls: ['./vm-calculator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: VMDeviceComponent,
      useExisting: forwardRef(() => VmCalculatorComponent),
    },
  ],
})
export class VmCalculatorComponent extends VMDeviceComponent {
  readonly CalculatorCommands = CalculatorCommands;

  override readonly device = Devices.CAL;

  override getCommandByName(commandName: CalculatorCommands): string | undefined {
    const commandLine = this.commandLines.find(({ name }) => name === commandName);
    if(!commandLine) {
      return;
    }
    return commandLine.getCommand();
  }
}
