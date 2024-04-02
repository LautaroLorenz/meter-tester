import { CommandsEnum } from '../enums/commands.model';
import { CommandBlock } from './command-block.model';

export interface EnableCommandCondition {
  pattern: string;
}

export interface CommandLine {
  name: CommandsEnum;
  blocks: CommandBlock[];
  enableConditions?: EnableCommandCondition[];
}
