export class CommandDirector {
  public static readonly CHAR_START = 'B';
  public static readonly CHAR_END = 'Z';
  public static readonly DIVIDER = '|';

  static getFrom(command: string): string {
    return this.getBlocks(command)[1] as string;
  }

  static getTo(command: string): string {
    return this.getBlocks(command)[2] as string;
  }

  static getBlocks(command: string): string[] {
    return command.split(this.DIVIDER);
  }
}
