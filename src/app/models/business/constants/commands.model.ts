import { CommandDirector } from '../class/command-director.model';

export const COMMANDS = {
    Software: {
        Generator: {
            START_ACTIVA: CommandDirector.encodeCompactNumber(1, 1, 0),
            START_REACTIVA: CommandDirector.encodeCompactNumber(2, 1, 0),
            STOP: CommandDirector.encodeCompactNumber(3, 1, 0)
        },
        Calculator: {
            STOP: 'STOP',
            RESET: 'RSET',
            RESULT_TS01: 'TS01',
            RESULT_TS02: 'TS02'
        }
    },
    Generator: {
        ACK: CommandDirector.encodeCompactNumber(1, 1, 0)
    }
};
