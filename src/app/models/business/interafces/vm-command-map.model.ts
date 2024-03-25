import { CommandsEnum } from '../enums/commands.model';
import { Devices } from '../enums/devices.model';

export interface VMCommandMap {
  device: Devices;
  commandRegex: string;
  responseCommandName: CommandsEnum;
}
