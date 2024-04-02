import { CommandBlockConfig } from './command-block-config.model';

export enum CommandBlockTypes {
  Fixed,
  Variable,
}

interface CommandBlockBase {
  type: CommandBlockTypes;
  value: string;
}

interface CommandBlockFixed extends CommandBlockBase {
  type: CommandBlockTypes.Fixed;
}

interface CommandBlockVariable extends CommandBlockBase {
  type: CommandBlockTypes.Variable;
  startWith?: string;
  endWith?: string;
  numberValue: number;
  digitsQuantity: number;
  padText: string;
  config: CommandBlockConfig;
}

export type CommandBlock = CommandBlockFixed | CommandBlockVariable;
