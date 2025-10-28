import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { VMCommandMap } from '../../../models/business/interafces/vm-command-map.model';
import { Devices } from '../../../models/business/enums/devices.model';
import { CommandDirector } from '../../../models/business/class/command-director.model';
import { DeviceConstants } from '../../../models/business/constants/devices-constant.model';
import { COMMANDS } from '../../../models/business/constants/commands.model';
import { CommandFormatterUtil } from '../../../utils/command-formatter.util';
import { PositionMemoryMap } from '../../../models/business/interafces/position-memory.model';

@Component({
    selector: 'app-command-map',
    templateUrl: './command-map.component.html',
    styleUrls: ['./command-map.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommandMapComponent {
    readonly columns = [
        {
            header: 'Dispositivo',
            field: 'deviceName'
        },
        {
            header: 'Recibe [start pattern]',
            field: 'startPattern'
        },
        {
            header: 'Última Respuesta',
            field: 'formatedLastResponse'
        }
    ];

    readonly COMMAND_START = `${CommandDirector.CHAR_START}${CommandDirector.DIVIDER}`;
    readonly COMMAND_END = `${CommandDirector.DIVIDER}${CommandDirector.CHAR_END}`;

    readonly map: VMCommandMap[] = [
        {
            device: Devices.GEN,
            deviceName: DeviceConstants[Devices.GEN],
            startPattern: `B\\|SG`,
            lastResponse: '',
            formatedLastResponse: '',
            automaticResponse: () =>
                `${this.COMMAND_START}${Devices.GEN}${Devices.STW}${CommandDirector.DIVIDER}${COMMANDS.Generator.ACK}${this.COMMAND_END}`
        },
        {
            device: Devices.PAT,
            deviceName: DeviceConstants[Devices.PAT],
            startPattern: `B\\|SP`,
            lastResponse: '',
            formatedLastResponse: '',
            automaticResponse: (command?: string) => this.getPatternAutomaticResponse(command || '')
        },
        {
            device: Devices.CAL,
            deviceName: DeviceConstants[Devices.CAL],
            startPattern: `B\\|SC\\|[\\s\\S]\\|(?:${COMMANDS.Software.Calculator.STOP}|\\n)`,
            lastResponse: '',
            formatedLastResponse: '',
            automaticResponse: (command?: string) => this.getCalculatorAutomaticAckResponse(command || '')
        },
        {
            device: Devices.CAL,
            deviceName: DeviceConstants[Devices.CAL],
            startPattern: `B\\|SC\\|[\\s\\S]\\|(?:${COMMANDS.Software.Calculator.RESET}|\\n)`,
            lastResponse: '',
            formatedLastResponse: '',
            automaticResponse: (command?: string) => this.getCalculatorAutomaticAckResponse(command || '')
        },
        {
            device: Devices.CAL,
            deviceName: DeviceConstants[Devices.CAL],
            startPattern: `B\\|SC\\|[\\s\\S]\\|(?:${COMMANDS.Software.Calculator.RESULT_TS01}|\\n)`,
            lastResponse: '',
            formatedLastResponse: '',
            automaticResponse: (command?: string) => this.getCalculatorAutomaticTS01Response(command || '')
        },
        {
            device: Devices.CAL,
            deviceName: DeviceConstants[Devices.CAL],
            startPattern: `B\\|SC\\|[\\s\\S]\\|(?:${COMMANDS.Software.Calculator.RESULT_TS02}|\\n)`,
            lastResponse: '',
            formatedLastResponse: '',
            automaticResponse: (command?: string) => this.getCalculatorAutomaticTS02Response(command || '')
        }
    ];

    private readonly cdr = inject(ChangeDetectorRef);

    // Memoria por puesto para hacer ensayos más realistas
    private positionMemory: PositionMemoryMap = {};

    get(command: string): VMCommandMap | undefined {
        const item = this.map.find((item) => {
            // Usar directamente el patrón ya escapado
            const regex = new RegExp(`^${item.startPattern}`);
            const matches = regex.test(command);
            return matches;
        });

        if (item) {
            // Extraer el puesto del comando si es del calculador
            const position = this.extractPositionFromCommand(command);

            if (position) {
                // Actualizar memoria del puesto
                this.updatePositionMemory(position, command);

                // Verificar si es RESET o STOP para limpiar memoria
                if (this.isResetOrStopCommand(command)) {
                    this.clearPositionMemory(position);
                }
            }

            item.lastResponse = item.automaticResponse(command);
            item.formatedLastResponse = CommandFormatterUtil.formatCommandForDisplay(item.lastResponse);
            this.cdr.detectChanges();
        }
        return item;
    }

    private getPatternAutomaticResponse(command: string): string {
        // Extraer los bloques del comando para obtener el puesto
        const inputBlocks = CommandDirector.getBlocks(command);
        const currentL1 = CommandDirector.decodeCompactNumber(inputBlocks[6] || '\x00\x00', 2);
        const currentL2 = CommandDirector.decodeCompactNumber(inputBlocks[7] || '\x00\x00', 2);
        const currentL3 = CommandDirector.decodeCompactNumber(inputBlocks[8] || '\x00\x00', 2);

        // B|PS|xKPx|UR|US|UT|IR|IS|IT|-PR|-PS|-PT|Z
        const blocks: string[] = [CommandDirector.CHAR_START, `${Devices.PAT}${Devices.STW}`];

        // xKPx - Patrón aleatorio (4 bytes, 0 decimales) - rango: 0 a 4294967295
        // const patternValue = Math.floor(Math.random() * 4294967296);
        // blocks.push(CommandDirector.encodeCompactNumber(patternValue, 4, 0));
        blocks.push(CommandDirector.encodeCompactNumber(2000000000, 4, 0));

        // Agregamos un multiplcador de corriente basado en la corriente de entrada
        let multiplier = 1;
        if (currentL1 < 2.4 && currentL2 < 2.4 && currentL3 < 2.4) {
            multiplier = 10;
        }
        blocks.push(CommandDirector.encodeCompactNumber(multiplier, 1, 0));
        // UR|US|UT - Tensiones aleatorias (2 bytes, 1 decimal) - rango: 0.0 a 255.9
        // const urValue = Math.random() * 255.9;
        // const usValue = Math.random() * 255.9;
        // const utValue = Math.random() * 255.9;
        blocks.push(CommandDirector.encodeCompactNumber(221.2, 2, 1));
        blocks.push(CommandDirector.encodeCompactNumber(0, 2, 1));
        blocks.push(CommandDirector.encodeCompactNumber(0, 2, 1));

        // IR|IS|IT - Corrientes aleatorias (2 bytes, 2 decimales) - rango: 0.00 a 25.59
        // Simular alarma de sobrecorriente con 5% de probabilidad
        // const shouldTriggerOvercurrent = Math.random() < 0.03; // 5% de probabilidad

        // if (shouldTriggerOvercurrent) {
        //     // Simular sobrecorriente: todas las corrientes bajo 2A, pero una supera 2.4A
        //     blocks.push(CommandDirector.encodeCompactNumber(1.5, 2, 2)); // L1: 1.5A (bajo 2A)
        //     blocks.push(CommandDirector.encodeCompactNumber(2.4, 2, 2)); // L2: 2.41A (sobrecorriente)
        //     blocks.push(CommandDirector.encodeCompactNumber(1.8, 2, 2)); // L3: 1.8A (bajo 2A)
        // } else {
            // Valores normales
            blocks.push(CommandDirector.encodeCompactNumber(4.98, 2, 2));
            blocks.push(CommandDirector.encodeCompactNumber(0, 2, 2));
            blocks.push(CommandDirector.encodeCompactNumber(0, 2, 2));
        // }

        // -PR|-PS|-PT - Factores de potencia aleatorios (1 byte, 2 decimales) - rango: 0.00 a 2.55
        // Generar signo aleatorio para PR
        // const prSign = Math.random() > 0.5 ? '-' : ' ';
        // const prType = Math.random() > 0.5 ? 'L' : 'C';
        blocks.push(`${' '}${CommandDirector.encodeCompactNumber(0.98, 1, 2)}${'L'}`);

        // Generar signo aleatorio para PS
        // const psSign = Math.random() > 0.5 ? '-' : ' ';
        // const psType = Math.random() > 0.5 ? 'L' : 'C';
        blocks.push(`${' '}${CommandDirector.encodeCompactNumber(0, 1, 2)}${'C'}`);

        // Generar signo aleatorio para PT
        // const ptSign = Math.random() > 0.5 ? '-' : ' ';
        // const ptType = Math.random() > 0.5 ? 'L' : 'C';
        blocks.push(`${' '}${CommandDirector.encodeCompactNumber(0, 1, 2)}${'C'}`);

        blocks.push(CommandDirector.CHAR_END);
        return blocks.join(CommandDirector.DIVIDER);
    }

    private getCalculatorAutomaticAckResponse(command: string): string {
        // Extraer los bloques del comando para obtener el puesto
        const blocks = CommandDirector.getBlocks(command);

        // El puesto está en el bloque 2 (índice 2) del comando
        // Comando: B|SC|PUESTO|COMANDO|Z
        // Bloques: [0]=B, [1]=SC, [2]=PUESTO, [3]=COMANDO, [4]=Z
        const position = blocks[2];

        const responseBlocks: string[] = [CommandDirector.CHAR_START, `${Devices.CAL}${Devices.STW}`];
        // Incluir el puesto en la respuesta
        responseBlocks.push(position);
        // Incluir espacio de resultados vacio para mantener longitud fija (3 bytes)
        responseBlocks.push('   ');
        responseBlocks.push(CommandDirector.CHAR_END);

        const response = responseBlocks.join(CommandDirector.DIVIDER);

        // Guardar la respuesta en la memoria del puesto si existe
        if (this.positionMemory[position]) {
            this.positionMemory[position].responsesSent.push(response);
        }

        return response;
    }

    private getCalculatorAutomaticTS01Response(command: string): string {
        // Extraer los bloques del comando para obtener el puesto
        const blocks = CommandDirector.getBlocks(command);

        // El puesto está en el bloque 2 (índice 2) del comando
        // Comando: B|SC|PUESTO|RESULT_TS01|Z
        // Bloques: [0]=B, [1]=SC, [2]=PUESTO, [3]=RESULT_TS01, [4]=Z
        const position = blocks[2];

        const responseBlocks: string[] = [CommandDirector.CHAR_START, `${Devices.CAL}${Devices.STW}`];
        // Incluir el puesto en la respuesta
        responseBlocks.push(position);

        // Obtener o crear memoria del puesto
        if (!this.positionMemory[position]) {
            // Generar tiempo de espera aleatorio entre 0 y 3 segundos
            const minWaitSeconds = Math.random() * 3; // 0 a 3 segundos

            this.positionMemory[position] = {
                position,
                commandsReceived: [],
                responsesSent: [],
                ts02Counter: 0,
                lastUpdate: new Date(),
                minWaitSeconds,
                lastCommandTime: new Date()
            };
        }

        // Incrementar contador con probabilidad solo si ha pasado el tiempo mínimo de espera
        const canUpdate = this.canUpdateRandomly(position);
        const shouldIncrement = canUpdate && Math.random() < 0.7;
        if (shouldIncrement) {
            this.positionMemory[position].ts02Counter++;
        }

        // Usar el contador como base para el valor, con un rango más realista
        // El contador se usa para generar un valor más consistente
        const baseValue = this.positionMemory[position].ts02Counter * 100;
        const randomVariation = Math.floor(Math.random() * 200) - 100; // -100 a +100
        const finalValue = Math.max(-9999, Math.min(9999, baseValue + randomVariation));

        const sign = finalValue < 0 ? '-' : ' ';
        const absoluteValue = Math.abs(finalValue);

        // Para contraste: punto fijo con 2 decimales, usar 2 bytes para el número entero
        // El punto fijo va en el medio, no se codifica con decimales
        const encodedValue = CommandDirector.encodeCompactNumber(absoluteValue, 2, 0);
        responseBlocks.push(`${sign}${encodedValue}`);

        // Guardar la respuesta en la memoria del puesto
        const response = responseBlocks.join(CommandDirector.DIVIDER);
        this.positionMemory[position].responsesSent.push(response);

        // Actualizar el tiempo del último comando procesado
        this.positionMemory[position].lastCommandTime = new Date();

        responseBlocks.push(CommandDirector.CHAR_END);
        return responseBlocks.join(CommandDirector.DIVIDER);
    }

    private getCalculatorAutomaticTS02Response(command: string): string {
        // Extraer los bloques del comando para obtener el puesto
        const blocks = CommandDirector.getBlocks(command);

        // El puesto está en el bloque 2 (índice 2) del comando
        // Comando: B|SC|PUESTO|RESULT_TS02|Z
        // Bloques: [0]=B, [1]=SC, [2]=PUESTO, [3]=RESULT_TS02, [4]=Z
        const position = blocks[2];

        const responseBlocks: string[] = [CommandDirector.CHAR_START, `${Devices.CAL}${Devices.STW}`];
        // Incluir el puesto en la respuesta
        responseBlocks.push(position);

        // Obtener o crear memoria del puesto
        if (!this.positionMemory[position]) {
            // Generar tiempo de espera aleatorio entre 0 y 3 segundos
            const minWaitSeconds = Math.random() * 3; // 0 a 3 segundos

            this.positionMemory[position] = {
                position,
                commandsReceived: [],
                responsesSent: [],
                ts02Counter: 0,
                lastUpdate: new Date(),
                minWaitSeconds,
                lastCommandTime: new Date()
            };
        }

        // Incrementar contador aleatoriamente para TS02 solo si ha pasado el tiempo mínimo de espera
        const canUpdate = this.canUpdateRandomly(position);
        const shouldIncrement = canUpdate && Math.random() < 0.5; // 50% de probabilidad de incrementar

        if (shouldIncrement) {
            this.positionMemory[position].ts02Counter++;
            // Solo actualizar lastCommandTime cuando realmente incrementamos
            this.positionMemory[position].lastCommandTime = new Date();
        }

        // La respuesta es directamente el valor del contador
        const finalValue = this.positionMemory[position].ts02Counter;
        // NO usamos el byte de signo, de esa forma podemos enviar numeros de 3 bytes
        const sign = '';

        // Para arranque/vacío: cantidad de impulsos, usar 3 bytes
        const encodedValue = CommandDirector.encodeCompactNumber(finalValue, 3, 0);
        responseBlocks.push(`${sign}${encodedValue}`);

        responseBlocks.push(CommandDirector.CHAR_END);

        const response = responseBlocks.join(CommandDirector.DIVIDER);

        // Guardar la respuesta en la memoria del puesto si existe
        if (this.positionMemory[position]) {
            this.positionMemory[position].responsesSent.push(response);
        }

        return response;
    }

    /**
     * Extrae el puesto del comando del calculador
     * @param command Comando completo
     * @returns Número de puesto o null si no es un comando del calculador
     */
    private extractPositionFromCommand(command: string): string | null {
        const blocks = CommandDirector.getBlocks(command);
        // Para comandos del calculador: B|SC|PUESTO|COMANDO|Z
        // El puesto está en el bloque 2 (índice 2)
        if (blocks.length >= 3 && blocks[1] === 'SC') {
            return blocks[2];
        }
        return null;
    }

    /**
     * Actualiza la memoria del puesto con el comando recibido
     * @param position Número de puesto
     * @param command Comando recibido
     */
    private updatePositionMemory(position: string, command: string): void {
        if (!this.positionMemory[position]) {
            // Generar tiempo de espera aleatorio entre 0 y 3 segundos
            const minWaitSeconds = Math.random() * 3; // 0 a 3 segundos

            this.positionMemory[position] = {
                position,
                commandsReceived: [],
                responsesSent: [],
                ts02Counter: 0,
                lastUpdate: new Date(),
                minWaitSeconds,
                lastCommandTime: new Date()
            };
        }

        this.positionMemory[position].commandsReceived.push(command);
        this.positionMemory[position].lastUpdate = new Date();
    }

    /**
     * Verifica si el comando es RESET o STOP
     * @param command Comando a verificar
     * @returns true si es RESET o STOP
     */
    private isResetOrStopCommand(command: string): boolean {
        const blocks = CommandDirector.getBlocks(command);
        if (blocks.length >= 4 && blocks[1] === 'SC') {
            const commandType = blocks[3];
            return (
                commandType === COMMANDS.Software.Calculator.RESET || commandType === COMMANDS.Software.Calculator.STOP
            );
        }
        return false;
    }

    /**
     * Verifica si ha pasado el tiempo mínimo de espera para el puesto
     * @param position Número de puesto
     * @returns true si puede actualizarse aleatoriamente
     */
    private canUpdateRandomly(position: string): boolean {
        const memory = this.positionMemory[position];
        if (!memory) return false;

        const now = new Date();
        const timeSinceLastCommand = (now.getTime() - memory.lastCommandTime.getTime()) / 1000; // en segundos

        return timeSinceLastCommand >= memory.minWaitSeconds;
    }

    /**
     * Limpia la memoria del puesto especificado
     * @param position Número de puesto
     */
    private clearPositionMemory(position: string): void {
        if (this.positionMemory[position]) {
            // Regenerar tiempo de espera aleatorio entre 0 y 3 segundos
            const minWaitSeconds = Math.random() * 3; // 0 a 3 segundos

            this.positionMemory[position].commandsReceived = [];
            this.positionMemory[position].responsesSent = [];
            this.positionMemory[position].ts02Counter = 0;
            this.positionMemory[position].lastUpdate = new Date();
            this.positionMemory[position].minWaitSeconds = minWaitSeconds;
            this.positionMemory[position].lastCommandTime = new Date();
        }
    }
}
