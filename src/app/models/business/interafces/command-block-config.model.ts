export enum CommandLineConfigTypes {
    Incremental,
    Random,
    CharRandom
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

export interface CommandBlockConfigCharRandom extends CommandBlockConfigBase {
    type: CommandLineConfigTypes.CharRandom;
    options: string[];
}

export type CommandBlockConfig =
    | CommandBlockConfigRandom
    | CommandBlockConfigCharRandom
    | CommandBlockConfigIncremental;
