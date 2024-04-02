import { Random } from '../../core/random.model';
import {
  CommandBlockConfigIncremental,
  CommandBlockConfigRandom,
  CommandLineConfigTypes,
} from '../interafces/command-block-config.model';
import {
  CommandBlock,
  CommandBlockTypes,
} from '../interafces/command-block.model';
import { CommandLine } from '../interafces/command-line.model';
import { CommandHistory } from '../interafces/commnad-history.model';
import { VMCommandMap } from '../interafces/vm-command-map.model';

export class CommandLineDirector {
  static findCommandValue(
    commandMap: VMCommandMap,
    commandLines: CommandLine[],
    history: CommandHistory[]
  ): string | undefined {
    const responseCommandName = commandMap.responseCommandName;
    const possibleCommandLineToResponse = commandLines.filter(
      ({ name }) => name === responseCommandName
    );
    // Buscar en el historial (ordenado de comando más reciente a más antiguo)
    // un comando que cumpla las enableConditions de las posibles commandLines de respuesta
    for (let i = 0; i < history.length; i++) {
      const { command } = history[i];
      const commandLine = possibleCommandLineToResponse.find(
        ({ enableConditions }) => {
          // si es una posible commandLine de respuesta y no tiene condiciones de activación, se emite como respuesta
          if (!enableConditions?.length) {
            return true;
          }
          return enableConditions.some(({ pattern }) => {
            return command.includes(pattern);
          });
        }
      );
      // si las enableConditions de la commandLine satisfacen, respondemos
      if (commandLine) {
        return this.getValue(commandLine);
      }
    }
    return undefined;
  }

  static getValue(commandLine: CommandLine): string {
    return commandLine.blocks.map(({ value }) => value).join('');
  }

  static refreshBlocks(commandLine: CommandLine): CommandBlock[] {
    return commandLine.blocks.map((block) => this.refreshBlockValue(block));
  }

  static refreshBlockValue(block: CommandBlock): CommandBlock {
    if (block.type === CommandBlockTypes.Fixed) {
      return block;
    }

    let numberValue = block.numberValue;
    if (block.config.probabilityOfChange >= Random.range(0, 100)) {
      switch (block.config.type) {
        case CommandLineConfigTypes.Incremental:
          numberValue = this.getBlockIncrementalValue(
            block.numberValue,
            block.config
          );
          break;
        case CommandLineConfigTypes.Random:
          numberValue = this.getBlockRandomValue(block.config);
          break;
      }
    }

    const start: string = block.startWith ?? '';
    const value: string = numberValue
      .toString()
      .padStart(block.digitsQuantity, block.padText);
    const end: string = block.endWith ?? '';

    block.numberValue = numberValue;
    block.value = `${start}${value}${end}`;
    return block;
  }

  static getBlockIncrementalValue(
    value: number,
    config: CommandBlockConfigIncremental
  ): number {
    const currentValue = Number(value);
    return currentValue + config.incrementQuantity;
  }

  static getBlockRandomValue(config: CommandBlockConfigRandom): number {
    return Random.range(config.minRandom, config.maxRandom);
  }
}
