export enum VMResponseTypes {
  Automatic,
  Manual,
}

export enum VMDelayTypes {
  Off,
  Fixed,
  Range,
}

export enum CommandRefreshType {
  Keep,
  Refresh,
}

export interface NumberRange {
  min: number;
  max: number;
}

export interface VirtualMachineConfig {
  responseType: VMResponseTypes;
  delayType: VMDelayTypes;
  fixedDelay: undefined | number;
  minDelay: number;
  maxDelay: number;
  commandRefreshType: CommandRefreshType;
}
