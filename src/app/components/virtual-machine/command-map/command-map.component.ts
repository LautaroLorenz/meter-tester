import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VMCommandMap } from '../../../models/business/interafces/vm-command-map.model';
import { Devices } from '../../../models/business/enums/devices.model';
import { CommandDirector } from '../../../models/business/class/command-director.model';
import { CalculatorCommands, SoftwareCalculatorCommands } from '../../../models/business/enums/commands.model';

@Component({
  selector: 'app-command-map',
  templateUrl: './command-map.component.html',
  styleUrls: ['./command-map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommandMapComponent {
  columns = [
    {
      header: 'Dispositivo',
      field: 'device',
    },
    {
      header: 'Recibe comando [Regex]',
      field: 'commandRegex',
    },
    {
      header: 'Responde comando',
      field: 'responseCommandName',
    },
  ];

  map: VMCommandMap[] = [
    {
      device: Devices.CAL,
      commandRegex: SoftwareCalculatorCommands.STOP,
      responseCommandName: CalculatorCommands.ACK,
    },
    {
      device: Devices.CAL,
      commandRegex: SoftwareCalculatorCommands.START_VACUUM,
      responseCommandName: CalculatorCommands.ACK,
    },
  ];

  get(command: string): VMCommandMap | undefined {
    const deviceTo: Devices = CommandDirector.getTo(command);
    return this.map
      .filter(({ device }) => device === deviceTo)
      .find(({ commandRegex }) => command.includes(commandRegex));
  }
}
