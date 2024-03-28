import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VMCommandMap } from '../../../models/business/interafces/vm-command-map.model';
import { Devices } from '../../../models/business/enums/devices.model';
import { CommandDirector } from '../../../models/business/class/command-director.model';
import {
  CalculatorResponseCommands,
  SoftwareCalculatorCommands,
} from '../../../models/business/enums/commands.model';
import { DeviceConstants } from '../../../models/business/constants/devices-constant.model';

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
      field: 'deviceName',
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
      deviceName: DeviceConstants[Devices.CAL],
      commandRegex: SoftwareCalculatorCommands.STOP,
      responseCommandName: CalculatorResponseCommands.ACK,
    },
    {
      device: Devices.CAL,
      deviceName: DeviceConstants[Devices.CAL],
      commandRegex: SoftwareCalculatorCommands.START_CONTRAST,
      responseCommandName: CalculatorResponseCommands.ACK,
    },
    {
      device: Devices.CAL,
      deviceName: DeviceConstants[Devices.CAL],
      commandRegex: SoftwareCalculatorCommands.START_BOOT,
      responseCommandName: CalculatorResponseCommands.ACK,
    },
    {
      device: Devices.CAL,
      deviceName: DeviceConstants[Devices.CAL],
      commandRegex: SoftwareCalculatorCommands.START_VACUUM,
      responseCommandName: CalculatorResponseCommands.ACK,
    },
    {
      device: Devices.CAL,
      deviceName: DeviceConstants[Devices.CAL],
      commandRegex: SoftwareCalculatorCommands.RESULTS,
      responseCommandName: CalculatorResponseCommands.RESULTS,
    },
  ];

  get(command: string): VMCommandMap | undefined {
    const deviceTo: Devices = CommandDirector.getTo(command);
    return this.map
      .filter(({ device }) => device === deviceTo)
      .find(({ commandRegex }) => command.includes(commandRegex));
  }
}
