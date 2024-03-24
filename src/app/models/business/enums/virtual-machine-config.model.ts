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
