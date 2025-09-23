import { CommandDirector } from '../class/command-director.model';

export const COMMANDS = {
    Software: {
        Generator: {
            START_ACTIVA: CommandDirector.encodeCompactNumber(1, 1, 0),
            START_REACTIVA: CommandDirector.encodeCompactNumber(2, 1, 0),
            STOP: CommandDirector.encodeCompactNumber(3, 1, 0)
        },
        Calculator: {
            STOP: CommandDirector.encodeCompactNumber(10, 1, 0),
            RESET: CommandDirector.encodeCompactNumber(20, 1, 0),
            RESULT_TS01: CommandDirector.encodeCompactNumber(1, 1, 0), // Constraste
            RESULT_TS02: CommandDirector.encodeCompactNumber(2, 1, 0) // Arranque y Vacío
        }
    },
    Generator: {
        ACK: CommandDirector.encodeCompactNumber(1, 1, 0)
    }
};
