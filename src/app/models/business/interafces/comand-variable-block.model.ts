import { CBVariableTypes } from '../enums/command-variable-block-config.model';

export interface CommandVariableBlockConfig {
  type: CBVariableTypes;
  probabilityOfChange: number;
}

export interface CommandVariableBlockConfigTypeRandom
  extends CommandVariableBlockConfig {
  type: CBVariableTypes.Random;
  minRandom: number;
  maxRandom: number;
}

export interface CommandVariableBlockConfigTypeIncremental
  extends CommandVariableBlockConfig {
  type: CBVariableTypes.Incremental;
  incrementQuantity: number;
}

export type CommandVariableBlockConfigType =
  | CommandVariableBlockConfigTypeRandom
  | CommandVariableBlockConfigTypeIncremental;
