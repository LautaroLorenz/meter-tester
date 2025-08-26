export enum CalculatorResponseCommands {
    ACK = 'ACK'
}

export enum PatternResponseCommands {
    CONSTANT = 'CONSTANT'
}

export enum GeneratorResponseCommands {
    ACK = 'ACK'
}

export enum SoftwareCalculatorCommands {
    RESULT_TS01 = 'TS01',
    RESULT_TS02 = 'TS02',
    STOP = 'STOP',
    RESET = 'RSET'
}

export enum SoftwarePatternCommands {
    CONSTANT_A = '|A|',
    CONSTANT_R = '|R|'
}

export enum SoftwareGeneratorCommands {
    START = 'START',
    STOP = 'STOP'
}

export type CommandsEnum =
    | CalculatorResponseCommands
    | PatternResponseCommands
    | GeneratorResponseCommands
    | SoftwarePatternCommands
    | SoftwareCalculatorCommands
    | SoftwareGeneratorCommands;
