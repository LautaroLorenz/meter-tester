import { CommandsEnum } from '../enums/commands.model';
import { CommandBlock } from './command-block.model';

export enum CommandLineConfigTypes {
  Incremental,
  Random,
}

export interface CommandLineConfig {
  type: CommandLineConfigTypes;
  probabilityOfChange: number; // Probabiliadad de que el valor cambie al refrescarlo
}

export interface CommandLineConfigTypeRandom extends CommandLineConfig {
  type: CommandLineConfigTypes.Random;
  minRandom: number;
  maxRandom: number;
}

export interface CommandLineConfigTypeIncremental extends CommandLineConfig {
  type: CommandLineConfigTypes.Incremental;
  incrementQuantity: number;
}

export type CommandLineConfigType =
  | CommandLineConfigTypeRandom
  | CommandLineConfigTypeIncremental;

export interface EnableCommandCondition {
  pattern: string;
}

export interface CommandLine {
  name: CommandsEnum;
  blocks: CommandBlock[];
  config?: CommandLineConfigType;
  enableConditions?: EnableCommandCondition[];
}
