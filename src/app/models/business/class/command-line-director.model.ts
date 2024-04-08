import { Random } from '../../core/random.model';
import {
  CommandBlockConfigCharRandom,
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
  static findCommandLine(
    commandMap: VMCommandMap,
    commandLines: CommandLine[],
    history: CommandHistory[]
  ): CommandLine | undefined {
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
        return commandLine;
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
    if (
      block.variableValue !== null &&
      block.config.probabilityOfChange < Random.range(0, 100)
    ) {
      return block;
    }

    let variableValue = block.variableValue;
    switch (block.config.type) {
      case CommandLineConfigTypes.Incremental:
        variableValue = this.getBlockIncrementalValue(
          block.variableValue,
          block.config
        );
        break;
      case CommandLineConfigTypes.Random:
        variableValue = this.getBlockRandomValue(block.config);
        break;
      case CommandLineConfigTypes.CharRandom:
        variableValue = this.getBlockCharRandomValue(block.config);
        break;
    }

    block.variableValue = variableValue;
    block.value = this.formatVariableValueToValue(
      variableValue,
      block.digitsQuantity,
      block.padText,
      block.startWith,
      block.endWith
    );
    return block;
  }

  static formatVariableValueToValue(
    variableValue: string | number,
    digitsQuantity: number,
    padText: string,
    startWith: string | undefined,
    endWith: string | undefined
  ): string {
    const start: string = startWith ?? '';
    const value: string = variableValue
      .toString()
      .padStart(digitsQuantity, padText);
    const end: string = endWith ?? '';
    return `${start}${value}${end}`;
  }

  static getBlockIncrementalValue(
    value: null | string | number,
    config: CommandBlockConfigIncremental
  ): number {
    if (value === null) {
      return 0;
    }
    const currentValue = Number(value);
    return currentValue + config.incrementQuantity;
  }

  static getBlockRandomValue(config: CommandBlockConfigRandom): number {
    return Random.range(config.minRandom, config.maxRandom);
  }

  static getBlockCharRandomValue(config: CommandBlockConfigCharRandom): string {
    const charIndex = Random.range(0, config.options.length - 1);
    return config.options[charIndex];
  }
}
