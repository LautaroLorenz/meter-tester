export enum CalculatorCommands {
  ACK = 'ACK',
}

export enum SoftwareCalculatorCommands {
  START_CONTRAST = 'TS1xxxxx',
  START_BOOT = 'TS2xxxxx',
  START_VACUUM = 'TS3xxxxx',
  STOP = 'STP00000',
}

export type CommandsEnum = CalculatorCommands | SoftwareCalculatorCommands;
