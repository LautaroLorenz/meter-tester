import { CommandsEnum } from '../enums/commands.model';
import { Devices } from '../enums/devices.model';

export interface VMCommandMap {
  device: Devices;
  deviceName: string;
  commandRegex: string;
  responseCommandName: CommandsEnum;
}
