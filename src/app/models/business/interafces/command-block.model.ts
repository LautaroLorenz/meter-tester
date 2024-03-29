import { CommandBlockTypes } from '../enums/command-block-types.model';

export interface CommandBlock {
  type: CommandBlockTypes;
  value: string;
}
