export enum CalculatorResponseCommands {
  ACK = 'ACK',
  RESULTS = 'RESULTS',
}

export enum SoftwareCalculatorCommands {
  START_CONTRAST = 'TS1xxxxx',
  START_BOOT = 'TS2xxxxx',
  START_VACUUM = 'TS3xxxxx',
  STOP = 'STP00000',
  RESULTS = 'STD00000',
}

export type CommandsEnum =
  | CalculatorResponseCommands
  | SoftwareCalculatorCommands;
