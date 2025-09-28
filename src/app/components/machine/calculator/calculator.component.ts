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

    stop$(activeStands: ActiveStand[]): Observable<string[]>;
    stop$(standIndex: number): Observable<string>;
    stop$(activeStandsOrIndex: ActiveStand[] | number): Observable<string[] | string> {
        // Handle single stand case
        if (typeof activeStandsOrIndex === 'number') {
            const standIndex = activeStandsOrIndex;
            const { standNumber, standBlock } = this.createStandBlock(standIndex);
            const command = this.buildCommand(standBlock, COMMANDS.Software.Calculator.STOP);
            return this.write$(command, () =>
                this.messagesService.error(`Error de comunicación puesto [${standNumber}]`)
            );
        }

        // Handle multiple stands case (original logic)
        const activeStands = activeStandsOrIndex;
        const observables = activeStands.map(({ index }) => {
            const { standNumber, standBlock } = this.createStandBlock(index);
            const command = this.buildCommand(standBlock, COMMANDS.Software.Calculator.STOP);
            return this.write$(command, () =>
                this.messagesService.error(`Error de comunicación puesto [${standNumber}]`)
            );
        });
        this.deviceStatus$.next(DeviceStatus.StopInProgress);
        return from(observables).pipe(
            concatMap((obs) => obs),
            toArray(),
            tap(() => this.deviceStatus$.next(DeviceStatus.Stopped))
        );
    }

    reset$(activeStands: ActiveStand[]): Observable<string[]> {
        const observables = activeStands.map(({ index }) => {
            const { standNumber, standBlock } = this.createStandBlock(index);
            const command = this.buildCommand(standBlock, COMMANDS.Software.Calculator.RESET);
            return this.write$(command, () =>
                this.messagesService.error(`Error de comunicación puesto [${standNumber}]`)
            );
        });
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
     * 2. Para stands locked: crea observable mock que emite respuesta con signo 'x'
     * 3. Para stands activos: usa el observable real que hace la comunicación
     * 4. Procesa todas las respuestas de forma unificada con mapTSxxResponse
     * 5. Stands locked automáticamente devuelven undefined (por signo 'x')
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
        // B|SC|P|T|xKPx|Xs|IxKm|Z
        const observables = activeStands.map((activeStand) => {
            const standIndex = activeStand.index;

            // Si el stand está locked, crear observable mock con signo 'x'
            if (lockedStands?.has(standIndex)) {
                const { standNumber } = this.createStandBlock(standIndex);
                // Crear respuesta mock con signo 'x' para que sea ignorada
                const mockResponse = `B|CS|${standNumber.toString().padStart(2, '0')}|x00|Z`;
                return of(mockResponse);
            }

            // Stand activo: usar observable real
            const { standNumber, standBlock } = this.createStandBlock(standIndex);
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
            const sign = resultBlock.charAt(0); // '-' o ' ' o 'x'
            const encodedValue = resultBlock.substring(1); // 2 caracteres con el valor codificado

            // Si el signo es 'x', ignorar este resultado
            if (sign === 'x') {
                return undefined;
            }

            // Decodificar el valor usando CommandDirector con los decimales apropiados
            const decodedValue = CommandDirector.decodeCompactNumber(encodedValue, this.resultDecimalsQuantity);

            // Aplicar el signo
            const resultValue = sign === '-' ? -decodedValue : decodedValue;
            return resultValue;
        });
    }

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

    private createStandBlock(standIndex: number): { standNumber: string; standBlock: string } {
        const standNumber = (standIndex + 1).toString().padStart(2, '0');
        const standBlock = `${CommandDirector.encodeCompactNumber(Number(standNumber), 1, 0)}`;
        return { standNumber, standBlock };
    }
}
