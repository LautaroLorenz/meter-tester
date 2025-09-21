import { CommandDirector } from '../class/command-director.model';

export const COMMANDS = {
    Software: {
        Generator: {
            START: 'START',
            STOP: 'STOP'
        },
        Calculator: {
            STOP: 'STOP',
            RESET: 'RSET',
            RESULT_TS01: 'TS01',
            RESULT_TS02: 'TS02'
        }
    },
    Generator: {
        ACK: CommandDirector.encodeCompactNumber(1)
    }
};
