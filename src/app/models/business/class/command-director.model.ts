import { Devices } from '../enums/devices.model';

export class CommandDirector {
  public static readonly CHAR_START = 'B';
  public static readonly CHAR_END = 'Z';
  public static readonly DIVIDER = '|';

  static getFrom(command: string): Devices {
    return this.getBlocks(command)[1] as Devices;
  }

  static getTo(command: string): Devices {
    return this.getBlocks(command)[2] as Devices;
  }

  static getBlocks(command: string): string[] {
    return command.split(this.DIVIDER);
  }

  static build(...blocks: string[]): string {
    const commandBlocks: string[] = [this.CHAR_START, ...blocks, this.CHAR_END];
    const commandBlocksText = commandBlocks.join(this.DIVIDER) + this.DIVIDER;
    const encoder = new TextEncoder();
    const byteArray = encoder.encode(commandBlocksText);
    const checksum = byteArray.reduce((acc, byte) => (acc += byte % 256), 0);
    return commandBlocksText.concat(checksum.toString(16));
  }
}
