import { Devices } from '../enums/devices.model';

export class CommandDirector {
  private static readonly CHAR_START = 'B';
  private static readonly CHAR_END = 'Z';
  private static readonly DIVIDER = '|';

  static getFrom(command: string): Devices {
    return this.getBlocks(command)[1] as Devices;
  }

  static getTo(command: string): Devices {
    return this.getBlocks(command)[2] as Devices;
  }

  static getBlocks(command: string): string[] {
    return command.split(this.DIVIDER);
  }
}
