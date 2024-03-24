import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VMCommandMap } from '../../../models/business/interafces/vm-command-map.model';
import {
  CalculatorCommands,
  Devices,
} from '../../../models/business/enums/devices.model';

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
      field: 'commandResponse',
    },
  ];

  map: VMCommandMap[] = [
    {
      device: Devices.CAL,
      commandRegex: 'B|STW|CAL',
      commandResponse: CalculatorCommands.ACK,
    },
  ];

  get(command: string): VMCommandMap | undefined {
    return this.map.find(({ commandRegex }) => command.includes(commandRegex));
  }
}
