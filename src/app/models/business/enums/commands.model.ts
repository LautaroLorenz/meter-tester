export enum CalculatorResponseCommands {
  ACK = 'ACK',
}

export enum PatternResponseCommands {
  CONSTANT = 'CONSTANT',
}

export enum SoftwareCalculatorCommands {
  RESULT_TS01 = 'TS01',
  RESULT_TS02 = 'TS02',
  STOP = 'STOP',
}

export enum SoftwarePatternCommands {
  CONSTANT_A = '|A|',
  CONSTANT_R = '|R|',
}

export type CommandsEnum =
  | CalculatorResponseCommands
  | PatternResponseCommands
  | SoftwarePatternCommands
  | SoftwareCalculatorCommands;
