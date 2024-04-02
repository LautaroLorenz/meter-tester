export enum CommandLineConfigTypes {
  Incremental,
  Random,
}

interface CommandBlockConfigBase {
  type: CommandLineConfigTypes;
  probabilityOfChange: number; // Probabiliadad de que el valor cambie al refrescarlo
}

export interface CommandBlockConfigRandom extends CommandBlockConfigBase {
  type: CommandLineConfigTypes.Random;
  minRandom: number;
  maxRandom: number;
}

export interface CommandBlockConfigIncremental extends CommandBlockConfigBase {
  type: CommandLineConfigTypes.Incremental;
  incrementQuantity: number;
}

export type CommandBlockConfig =
  | CommandBlockConfigRandom
  | CommandBlockConfigIncremental;
