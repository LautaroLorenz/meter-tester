export enum CalculatorCommands {
  ACK_RESULTS = 'ACK_RESULTS',
  ACK_START = 'ACK_START',
  ACK_STOP = 'ACK_STOP',
}

export enum SoftwareCalculatorCommands {
  START_CONTRAST = 'TS1xxxxx',
  START_BOOT = 'TS2xxxxx',
  START_VACUUM = 'TS3xxxxx',
  STOP = 'STP00000',
  RESULTS = 'STD00000',
}

export type CommandsEnum = CalculatorCommands | SoftwareCalculatorCommands;
