export enum CalculatorResponseCommands {
  ACK = 'ACK',
  RESULTS = 'RESULTS',
}

export enum PatternResponseCommands {
  STATUS = 'STATUS',
}

export enum SoftwareCalculatorCommands {
  START_CONTRAST = 'TS1xxxxx',
  START_BOOT = 'TS2xxxxx',
  START_VACUUM = 'TS3xxxxx',
  STOP = 'STP00000',
  RESULTS = 'STD00000',
}

export enum SoftwarePatternCommands {
  STATUS = 'STD00000',
}

export type CommandsEnum =
  | CalculatorResponseCommands
  | PatternResponseCommands
  | SoftwarePatternCommands
  | SoftwareCalculatorCommands;
