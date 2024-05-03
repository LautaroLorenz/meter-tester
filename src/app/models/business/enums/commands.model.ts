export enum CalculatorResponseCommands {
  ACK = 'ACK',
  RESULTS = 'RESULTS',
}

export enum PatternResponseCommands {
  CONSTANT = 'CONSTANT',
}

export enum SoftwareCalculatorCommands {
  START_CONTRAST = 'TS1xxxxx',
  START_BOOT = 'TS2xxxxx',
  START_VACUUM = 'TS3xxxxx',
  STOP = 'STP00000',
  RESULTS = 'STD00000',
}

export enum SoftwarePatternCommands {
  // envía un único comando
  CONSTANT_A = '|A|',
  CONSTANT_R = '|R|',
}

export type CommandsEnum =
  | CalculatorResponseCommands
  | PatternResponseCommands
  | SoftwarePatternCommands
  | SoftwareCalculatorCommands;
