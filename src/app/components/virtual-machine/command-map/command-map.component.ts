import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { VMCommandMap } from '../../../models/business/interafces/vm-command-map.model';
import { Devices } from '../../../models/business/enums/devices.model';
import { CommandDirector } from '../../../models/business/class/command-director.model';
import { DeviceConstants } from '../../../models/business/constants/devices-constant.model';
import { COMMANDS } from '../../../models/business/constants/commands.model';
import { CommandFormatterUtil } from '../../../utils/command-formatter.util';

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
            automaticResponse: () => this.getPatternAutomaticResponse()
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

    get(command: string): VMCommandMap | undefined {
        const item = this.map.find((item) => {
            // Usar directamente el patrón ya escapado
            const regex = new RegExp(`^${item.startPattern}`);
            const matches = regex.test(command);
            return matches;
        });
        if (item) {
            item.lastResponse = item.automaticResponse(command);
            item.formatedLastResponse = CommandFormatterUtil.formatCommandForDisplay(item.lastResponse);
            this.cdr.detectChanges();
        }
        return item;
    }

    private getPatternAutomaticResponse(): string {
        // B|PS|xKPx|UR|US|UT|IR|IS|IT|-PR|-PS|-PT|Z
        const blocks: string[] = [CommandDirector.CHAR_START, `${Devices.PAT}${Devices.STW}`];

        // xKPx - Patrón aleatorio (4 bytes, 0 decimales) - rango: 0 a 4294967295
        // const patternValue = Math.floor(Math.random() * 4294967296);
        // blocks.push(CommandDirector.encodeCompactNumber(patternValue, 4, 0));
        blocks.push(CommandDirector.encodeCompactNumber(2000000000, 4, 0));

        // UR|US|UT - Tensiones aleatorias (2 bytes, 1 decimal) - rango: 0.0 a 255.9
        // const urValue = Math.random() * 255.9;
        // const usValue = Math.random() * 255.9;
        // const utValue = Math.random() * 255.9;
        blocks.push(CommandDirector.encodeCompactNumber(220, 2, 1));
        blocks.push(CommandDirector.encodeCompactNumber(220, 2, 1));
        blocks.push(CommandDirector.encodeCompactNumber(220, 2, 1));

        // IR|IS|IT - Corrientes aleatorias (2 bytes, 2 decimales) - rango: 0.00 a 25.59
        // const irValue = Math.random() * 25.59;
        // const isValue = Math.random() * 25.59;
        // const itValue = Math.random() * 25.59;
        blocks.push(CommandDirector.encodeCompactNumber(5, 2, 2));
        blocks.push(CommandDirector.encodeCompactNumber(5, 2, 2));
        blocks.push(CommandDirector.encodeCompactNumber(5, 2, 2));

        // -PR|-PS|-PT - Factores de potencia aleatorios (1 byte, 2 decimales) - rango: 0.00 a 2.55
        const prValue = Math.random() * 2.55;
        const psValue = Math.random() * 2.55;
        const ptValue = Math.random() * 2.55;

        // Generar signo aleatorio para PR
        const prSign = Math.random() > 0.5 ? '-' : ' ';
        const prType = Math.random() > 0.5 ? 'L' : 'C';
        blocks.push(`${prSign}${CommandDirector.encodeCompactNumber(prValue, 1, 2)}${prType}`);

        // Generar signo aleatorio para PS
        const psSign = Math.random() > 0.5 ? '-' : ' ';
        const psType = Math.random() > 0.5 ? 'L' : 'C';
        blocks.push(`${psSign}${CommandDirector.encodeCompactNumber(psValue, 1, 2)}${psType}`);

        // Generar signo aleatorio para PT
        const ptSign = Math.random() > 0.5 ? '-' : ' ';
        const ptType = Math.random() > 0.5 ? 'L' : 'C';
        blocks.push(`${ptSign}${CommandDirector.encodeCompactNumber(ptValue, 1, 2)}${ptType}`);

        blocks.push(CommandDirector.CHAR_END);
        return blocks.join(CommandDirector.DIVIDER);
    }

    private getCalculatorAutomaticAckResponse(command: string): string {
        // Extraer los bloques del comando para obtener el puesto
        const blocks = CommandDirector.getBlocks(command);

        // El puesto está en el bloque 2 (índice 2) del comando
        // Comando: B|SC|PUESTO|STOP|Z
        // Bloques: [0]=B, [1]=SC, [2]=PUESTO, [3]=STOP, [4]=Z
        const position = blocks[2];

        const responseBlocks: string[] = [CommandDirector.CHAR_START, `${Devices.CAL}${Devices.STW}`];
        // Incluir el puesto en la respuesta
        responseBlocks.push(position);
        // Incluir espacio de resultados vacio para mantener longitud fija (3 bytes)
        responseBlocks.push('   ');
        responseBlocks.push(CommandDirector.CHAR_END);
        return responseBlocks.join(CommandDirector.DIVIDER);
    }

    private getCalculatorAutomaticTS01Response(command: string): string {
        // Extraer los bloques del comando para obtener el puesto
        const blocks = CommandDirector.getBlocks(command);

        // El puesto está en el bloque 2 (índice 2) del comando
        // Comando: B|SC|PUESTO|STOP|Z
        // Bloques: [0]=B, [1]=SC, [2]=PUESTO, [3]=STOP, [4]=Z
        const position = blocks[2];

        const responseBlocks: string[] = [CommandDirector.CHAR_START, `${Devices.CAL}${Devices.STW}`];
        // Incluir el puesto en la respuesta
        responseBlocks.push(position);

        // Resultados aleatorios -9999 a 9999
        // Generar valor entre -9999 y 9999
        const randomValue = Math.floor(Math.random() * 19999) - 9999; // -9999 a 9999
        const sign = randomValue < 0 ? '-' : ' ';
        const absoluteValue = Math.abs(randomValue);

        // Para contraste: punto fijo con 2 decimales, usar 2 bytes para el número entero
        // El punto fijo va en el medio, no se codifica con decimales
        const encodedValue = CommandDirector.encodeCompactNumber(absoluteValue, 2, 0);
        responseBlocks.push(`${sign}${encodedValue}`);

        responseBlocks.push(CommandDirector.CHAR_END);
        return responseBlocks.join(CommandDirector.DIVIDER);
    }

    private getCalculatorAutomaticTS02Response(command: string): string {
        // Extraer los bloques del comando para obtener el puesto
        const blocks = CommandDirector.getBlocks(command);

        // El puesto está en el bloque 2 (índice 2) del comando
        // Comando: B|SC|PUESTO|STOP|Z
        // Bloques: [0]=B, [1]=SC, [2]=PUESTO, [3]=STOP, [4]=Z
        const position = blocks[2];

        const responseBlocks: string[] = [CommandDirector.CHAR_START, `${Devices.CAL}${Devices.STW}`];
        // Incluir el puesto en la respuesta
        responseBlocks.push(position);

        // Resultados aleatorios para arranque/vacío: cantidad de impulsos
        // Valor máximo 16,777,215 (3 bytes)
        const randomValue = Math.floor(Math.random() * 500); // 0 a 16,777,215
        // NO usamos el byte de signo , de esa forma podemos enviar numeros de 3 bytes
        const sign = '';

        // Para arranque/vacío: cantidad de impulsos, usar 3 bytes
        const encodedValue = CommandDirector.encodeCompactNumber(randomValue, 3, 0);
        responseBlocks.push(`${sign}${encodedValue}`);

        responseBlocks.push(CommandDirector.CHAR_END);
        return responseBlocks.join(CommandDirector.DIVIDER);
    }
}
