import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { MachineDeviceComponent } from '../../../models/business/class/machine-device.model';
import { Devices } from '../../../models/business/enums/devices.model';
import { COMMANDS } from '../../../models/business/constants/commands.model';
import { Observable, map, tap, from, toArray, concatMap, delay } from 'rxjs';
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

    private readonly resultsDelayMs = 500;

    stop$(activeStands: ActiveStand[]): Observable<string[]> {
        const observables = activeStands.map(({ index }) => {
            const standNumber = (index + 1).toString().padStart(2, '0');
            const standBlock = `${CommandDirector.encodeCompactNumber(Number(standNumber), 1, 0)}`;
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
            const standNumber = (index + 1).toString().padStart(2, '0');
            const standBlock = `${CommandDirector.encodeCompactNumber(Number(standNumber), 1, 0)}`;
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

    resultsTS01$(
        activeStands: ActiveStand[],
        patternConstant: number,
        stepMeterPulses: number,
        stepMeterConstant: MeterConstantEnum
    ): Observable<CommandResultResponse[]> {
        // B|SC|P|T|xKPx|Xs|IxKm|Z
        const observables = activeStands.map((activeStand) => {
            const standNumber = (activeStand.index + 1).toString().padStart(2, '0');
            const standBlock = `${CommandDirector.encodeCompactNumber(Number(standNumber), 1, 0)}`;
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
            delay(this.resultsDelayMs),
            concatMap((obs) => obs),
            toArray(),
            map((responses) => this.mapTSxxResponse(responses))
        );
    }

    resultsTS02$(activeStands: ActiveStand[]): Observable<CommandResultResponse[]> {
        const observables = activeStands.map((activeStand) => {
            const standNumber = (activeStand.index + 1).toString().padStart(2, '0');
            const standBlock = `${CommandDirector.encodeCompactNumber(Number(standNumber), 1, 0)}`;
            const command = this.buildCommand(standBlock, COMMANDS.Software.Calculator.RESULT_TS02);
            return this.write$(command, () =>
                this.messagesService.error(`Error de comunicación puesto [${standNumber}]`)
            );
        });
        this.deviceStatus$.next(DeviceStatus.Working);
        return from(observables).pipe(
            delay(this.resultsDelayMs),
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
            const sign = resultBlock.charAt(0); // '-' o ' '
            const encodedValue = resultBlock.substring(1); // 2 caracteres con el valor codificado

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
}
