import { GeneratorEnum } from '../business/enums/generator-enum.model';
import { PatternEnum } from '../business/enums/pattern-enum.model';

export interface Environment {
    // flag si es producción
    production: boolean;

    // nombre del ambiente
    environment: string;

    // cantidad de puestos que tiene la máquina
    standsQuantity: number;

    // modelo del generador
    generatorType: GeneratorEnum;

    // modelo del patrón
    patternType: PatternEnum;

    // completa pasos automaticamente
    skipSteps: Record<string, boolean>;

    // activa la maquina virtual
    virtualMachine: boolean;

    // activa el historial de logs
    logsHistory: boolean;

    // delays para comandos y ciclos
    delays: {
        // delay entre verificaciones contra el patrón (ms)
        patternCheckCycleDelay: number;
        // delay para resultados del calculador (ms)
        resultsDelay: number;
        // delay para loops de dispositivos (ms)
        loopDelay: number;
    };
}
