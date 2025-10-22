import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { MachineDeviceComponent } from '../../../models/business/class/machine-device.model';
import { Devices } from '../../../models/business/enums/devices.model';
import { COMMANDS } from '../../../models/business/constants/commands.model';
import { Observable, map, tap, from, toArray, concatMap, of } from 'rxjs';
import { Stand } from '../../../models/business/interafces/stand.model';
import { MeterConstantEnum, MeterConstantUnitEnum } from '../../../models/business/constants/meter-constant.model';
import { DeviceStatus } from '../../../models/business/enums/device-status.model';
import { StandMeterConstantPipe } from '../../../pipes/business/stand-meter-constant.pipe';
import { CommandDirector } from '../../../models/business/class/command-director.model';
import { ActiveStand } from '../../../models/business/interafces/active-stand.model';
import { CommandResultResponse } from '../../../models/business/interafces/stand-result.model';
import { IGNORED_RESULT_SIGN, IGNORED_RESULT_PATTERN } from '../../../models/business/constants/result-constants.model';

@Component({
    selector: 'app-calculator',
    templateUrl: './calculator.component.html',
    styleUrls: ['./calculator.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CalculatorComponent extends MachineDeviceComponent {
    @Input() resultDecimalsQuantity!: number;
    @Input() visibility: 'visible' | 'hidden' = 'visible';

    override readonly device = Devices.CAL;

    readonly standMeterConstantPipe = inject(StandMeterConstantPipe);

    /**
     * Detiene el calculador en uno o múltiples stands
     * @param activeStands Array de stands activos
     * @returns Observable que emite array de respuestas
     */
    stop$(activeStands: ActiveStand[]): Observable<string[]>;
    /**
     * Detiene el calculador en un stand específico
     * @param standIndex Índice del stand
     * @returns Observable que emite respuesta individual
     */
    stop$(standIndex: number): Observable<string>;
    stop$(activeStandsOrIndex: ActiveStand[] | number): Observable<string[] | string> {
        // Handle single stand case
        if (typeof activeStandsOrIndex === 'number') {
            return this.createSingleStandObservable(activeStandsOrIndex, COMMANDS.Software.Calculator.STOP);
        }

        // Handle multiple stands case
        const activeStands = activeStandsOrIndex;
        const observables = activeStands.map(({ index }) =>
            this.createSingleStandObservable(index, COMMANDS.Software.Calculator.STOP)
        );

        this.deviceStatus$.next(DeviceStatus.StopInProgress);
        return from(observables).pipe(
            concatMap((obs) => obs),
            toArray(),
            tap(() => this.deviceStatus$.next(DeviceStatus.Stopped))
        );
    }

    /**
     * Detiene el calculador en un stand específico y devuelve un resultado TS01
     * @param standIndex Índice del stand
     * @returns Observable que emite resultado de comando TS01
     */
    stopStandWithResultTS01$(standIndex: number): Observable<CommandResultResponse> {
        const { standNumber, standBlock } = this.createStandBlock(standIndex);
        const fullCommand = this.buildCommand(standBlock, COMMANDS.Software.Calculator.STOP);

        return this.write$(fullCommand, () =>
            this.messagesService.error(`Error de comunicación puesto [${standNumber}]`)
        ).pipe(map((response) => this.mapTSxxResponse([response])[0]));
    }

    /**
     * Resetea el calculador en múltiples stands
     * @param activeStands Array de stands activos
     * @returns Observable que emite array de respuestas
     */
    reset$(activeStands: ActiveStand[]): Observable<string[]> {
        const observables = activeStands.map(({ index }) =>
            this.createSingleStandObservable(index, COMMANDS.Software.Calculator.RESET)
        );
        return from(observables).pipe(
            concatMap((obs) => obs),
            toArray()
        );
    }

    /**
     * Solicita resultados de medición TS01 a los stands activos.
     *
     * Funcionamiento:
     * 1. Genera comandos para todos los stands activos con los parámetros proporcionados
     * 2. Para stands locked: crea observable mock que emite respuesta con signo 'X'
     * 3. Para stands activos: usa el observable real que hace la comunicación
     * 4. Procesa todas las respuestas de forma unificada con mapTSxxResponse
     * 5. Stands locked automáticamente devuelven undefined (por signo 'X')
     *
     * @param activeStands Array de stands activos en el test
     * @param patternConstant Constante del patrón para el cálculo
     * @param stepMeterPulses Pulsos del medidor configurados en el paso
     * @param stepMeterConstant Constante del medidor configurada en el paso
     * @param lockedStands Set opcional de índices de stands que están locked
     * @returns Observable que emite array de resultados con la misma longitud que activeStands
     */
    resultsTS01$(
        activeStands: ActiveStand[],
        patternConstant: number,
        stepMeterPulses: number,
        stepMeterConstant: MeterConstantEnum,
        lockedStands?: Set<number>
    ): Observable<CommandResultResponse[]> {
        const observables = activeStands.map((activeStand) => {
            const standIndex = activeStand.index;

            // Si el stand está locked, crear observable mock con signo 'X'
            if (lockedStands?.has(standIndex)) {
                return this.createLockedStandMockResponse(standIndex);
            }

            // Stand activo: usar observable real
            return this.createActiveStandObservable(activeStand, patternConstant, stepMeterPulses, stepMeterConstant);
        });

        this.deviceStatus$.next(DeviceStatus.Working);
        return from(observables).pipe(
            concatMap((obs) => obs),
            toArray(),
            map((responses) => this.mapTSxxResponse(responses))
        );
    }

    /**
     * Solicita resultados de medición TS02 (Arranque y Vacío) a los stands activos
     * @param activeStands Array de stands activos en el test
     * @returns Observable que emite array de resultados con la misma longitud que activeStands
     */
    resultsTS02$(activeStands: ActiveStand[]): Observable<CommandResultResponse[]> {
        const observables = activeStands.map((activeStand) => {
            const { standNumber, standBlock } = this.createStandBlock(activeStand.index);
            const command = this.buildCommand(standBlock, COMMANDS.Software.Calculator.RESULT_TS02);
            return this.write$(command, () =>
                this.messagesService.error(`Error de comunicación puesto [${standNumber}]`)
            );
        });
        this.deviceStatus$.next(DeviceStatus.Working);
        return from(observables).pipe(
            concatMap((obs) => obs),
            toArray(),
            map((responses) => this.mapTSxxResponse(responses))
        );
    }

    /**
     * Procesa las respuestas de comandos TS01/TS02 y las convierte en resultados numéricos
     *
     * Maneja el mecanismo de ignorar resultados:
     * - Si el signo es 'X', devuelve undefined (stand locked o error)
     * - Si el signo es '-', aplica valor negativo
     * - Si el signo es ' ', aplica valor positivo
     *
     * @param commands Array de respuestas de comandos
     * @returns Array de resultados procesados (undefined para resultados ignorados)
     */
    private mapTSxxResponse(commands: string[]): CommandResultResponse[] {
        return commands.map((command) => {
            const blocks = CommandDirector.getBlocks(command);

            // El resultado está en el bloque 3 (índice 3)
            // Estructura: B|CS|PUESTO|RESULTADO|Z
            // RESULTADO: 3 caracteres codificados
            const resultBlock = blocks[3];

            if (!resultBlock || resultBlock.length < 3) {
                return undefined;
            }

            // Extraer signo y valor codificado
            const sign = resultBlock.charAt(0); // '-' o ' ' o 'X'
            const encodedValue = resultBlock.substring(1); // 2 caracteres con el valor codificado

            // Si el signo es 'X', ignorar este resultado (stand locked o error)
            if (sign === IGNORED_RESULT_SIGN) {
                return undefined;
            }

            // Decodificar el valor usando CommandDirector con los decimales apropiados
            const decodedValue = CommandDirector.decodeCompactNumber(encodedValue, this.resultDecimalsQuantity);

            // Aplicar el signo
            const resultValue = sign === '-' ? -decodedValue : decodedValue;
            return resultValue;
        });
    }

    /**
     * Genera el bloque de constante del medidor para comandos TS01
     *
     * Codifica la constante según el tipo de unidad:
     * - Unidades de impulso (I): 7 enteros, 0 decimales
     * - Unidades de energía (W): 3 enteros, 4 decimales
     *
     * @param stepMeterConstant Constante del medidor configurada en el paso
     * @param stand Stand del cual obtener la información del medidor
     * @returns String codificado con la constante del medidor
     */
    private getMeterConstantBlock(stepMeterConstant: MeterConstantEnum, stand: Stand): string {
        const getStartChar = (standConstantUnit: MeterConstantUnitEnum): 'I' | 'W' => {
            switch (standConstantUnit) {
                case MeterConstantUnitEnum.impKvarh:
                case MeterConstantUnitEnum.impKwh:
                    return 'I';
                case MeterConstantUnitEnum.varhImp:
                case MeterConstantUnitEnum.whImp:
                    return 'W';
            }
        };
        const meterConstantUnit = this.standMeterConstantPipe.transform(
            stepMeterConstant,
            stand.foreign.meter,
            'OnlyUnit'
        );
        const meterConstantValue = this.standMeterConstantPipe.transform(
            stepMeterConstant,
            stand.foreign.meter,
            'OnlyValue'
        );
        const startChart = getStartChar(meterConstantUnit as MeterConstantUnitEnum);
        let value = '';
        // 7 dígitos enteros
        if (startChart === 'I') {
            // 3 bytes: 7 enteros y 0 decimales
            value = CommandDirector.encodeCompactNumber(Number(meterConstantValue), 3, 0);
        }
        // 3 enteros y 4 decimales
        if (startChart === 'W') {
            // 3 bytes: 3 enteros y 4 decimales
            value = CommandDirector.encodeCompactNumber(Number(meterConstantValue), 3, 4);
        }
        return `${startChart}${value}`;
    }

    /**
     * Crea un observable para un comando simple en un stand específico
     * @param standIndex Índice del stand
     * @param command Comando a ejecutar
     * @returns Observable que emite la respuesta
     */
    private createSingleStandObservable(standIndex: number, command: string): Observable<string> {
        const { standNumber, standBlock } = this.createStandBlock(standIndex);
        const fullCommand = this.buildCommand(standBlock, command);
        return this.write$(fullCommand, () =>
            this.messagesService.error(`Error de comunicación puesto [${standNumber}]`)
        );
    }

    /**
     * Crea un observable mock para stands locked que devuelve una respuesta con signo 'X'
     * @param standIndex Índice del stand locked
     * @returns Observable que emite respuesta mock
     */
    private createLockedStandMockResponse(standIndex: number): Observable<string> {
        const { standBlock } = this.createStandBlock(standIndex);
        // Usar buildCommand para mantener consistencia con el formato de comandos
        const mockCommand = this.buildCommand(
            standBlock,
            COMMANDS.Software.Calculator.RESULT_TS01,
            CommandDirector.encodeCompactNumber(0, 4, 0), // pattern = 0
            CommandDirector.encodeCompactNumber(0, 2, 0), // pulses = 0
            CommandDirector.encodeCompactNumber(0, 3, 0) // meterConstant = 0
        );

        // Reemplazar el resultado con el patrón de resultado ignorado para indicar stand locked
        const mockResponse = mockCommand.replace(/[^|]*$/, IGNORED_RESULT_PATTERN);
        return of(mockResponse);
    }

    /**
     * Crea un observable real para stands activos
     * @param activeStand Stand activo
     * @param patternConstant Constante del patrón
     * @param stepMeterPulses Pulsos del medidor
     * @param stepMeterConstant Constante del medidor
     * @returns Observable que emite respuesta real
     */
    private createActiveStandObservable(
        activeStand: ActiveStand,
        patternConstant: number,
        stepMeterPulses: number,
        stepMeterConstant: MeterConstantEnum
    ): Observable<string> {
        const { standNumber, standBlock } = this.createStandBlock(activeStand.index);
        const pattern = CommandDirector.encodeCompactNumber(patternConstant, 4, 0);
        const pulses = CommandDirector.encodeCompactNumber(stepMeterPulses, 2, 0);
        const meterConstant = this.getMeterConstantBlock(stepMeterConstant, activeStand.stand);
        const command = this.buildCommand(
            standBlock,
            COMMANDS.Software.Calculator.RESULT_TS01,
            pattern,
            pulses,
            meterConstant
        );
        return this.write$(command, () => this.messagesService.error(`Error de comunicación puesto [${standNumber}]`));
    }

    /**
     * Crea los bloques necesarios para identificar un stand en los comandos
     * @param standIndex Índice del stand (0-based)
     * @returns Objeto con número de stand formateado y bloque codificado
     */
    private createStandBlock(standIndex: number): { standNumber: string; standBlock: string } {
        const standNumber = (standIndex + 1).toString().padStart(2, '0');
        const standBlock = `${CommandDirector.encodeCompactNumber(Number(standNumber), 1, 0)}`;
        return { standNumber, standBlock };
    }
}
