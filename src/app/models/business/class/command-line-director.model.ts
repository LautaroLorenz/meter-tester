import { Random } from '../../core/random.model';
import { CommandBlockTypes } from '../enums/command-block-types.model';
import { CommandBlock } from '../interafces/command-block.model';
import {
  CommandLine,
  CommandLineConfigType,
  CommandLineConfigTypeIncremental,
  CommandLineConfigTypeRandom,
  CommandLineConfigTypes,
} from '../interafces/command-line.model';

export class CommandLineDirector {
  static getValue(commandLine: CommandLine): string {
    return commandLine.blocks.map(({ value }) => value).join('');
  }

  static refreshBlocks(commandLine: CommandLine): CommandBlock[] {
    if (commandLine.config === undefined) {
      return commandLine.blocks;
    }
    return commandLine.blocks.map((block) =>
      this.refreshBlockValue(block, commandLine.config)
    );
  }

  static refreshBlockValue(
    block: CommandBlock,
    config: CommandLineConfigType | undefined
  ): CommandBlock {
    if (!config) {
      return block;
    }
    if (block.type === CommandBlockTypes.Fixed) {
      return block;
    }
    if (config.probabilityOfChange < Random.range(0, 100)) {
      return block;
    }
    const digitsQuantity = block.value.length;
    let newValue: number;
    switch (config.type) {
      case CommandLineConfigTypes.Incremental:
        newValue = this.getBlockIncrementalValue(block.value, config);
        break;
      case CommandLineConfigTypes.Random:
        newValue = this.getBlockRandomValue(config);
        break;
    }
    block.value = newValue.toString().padStart(digitsQuantity, '0');
    return block;
  }

  static getBlockIncrementalValue(
    value: string,
    config: CommandLineConfigTypeIncremental
  ): number {
    const currentValue = Number(value);
    return currentValue + config.incrementQuantity;
  }

  static getBlockRandomValue(config: CommandLineConfigTypeRandom): number {
    return Random.range(config.minRandom, config.maxRandom);
  }
}
