import {
  ChangeDetectionStrategy,
  Component,
  Input,
  inject,
} from '@angular/core';
import { MachineDeviceComponent } from '../../../models/business/class/machine-device.model';
import { Devices } from '../../../models/business/enums/devices.model';
import { SoftwareCalculatorCommands } from '../../../models/business/enums/commands.model';
import { Observable, map, tap, from, toArray, concatMap, delay } from 'rxjs';
import { Stand } from '../../../models/business/interafces/stand.model';
import {
  MeterConstantEnum,
  MeterConstantUnitEnum,
} from '../../../models/business/constants/meter-constant.model';
import { DeviceStatus } from '../../../models/business/enums/device-status.model';
import { StandMeterConstantPipe } from '../../../pipes/business/stand-meter-constant.pipe';
import { CommandDirector } from '../../../models/business/class/command-director.model';
import { ActiveStand } from '../../../models/business/interafces/active-stand.model';

@Component({
  selector: 'app-calculator',
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalculatorComponent extends MachineDeviceComponent {
  @Input() resultDecimalsQuantity!: number;

  override readonly device = Devices.CAL;

  readonly standMeterConstantPipe = inject(StandMeterConstantPipe);

  private readonly resultsDelayMs = 500;

  stop$(activeStands: ActiveStand[]): Observable<string[]> {
    const observables = activeStands.map(({ index }) => {
      const standNumber = (index + 1).toString().padStart(2, '0');
      const standBlock = `P${standNumber}`;
      const command = this.buildCommand(
        standBlock,
        SoftwareCalculatorCommands.STOP
      );
      return this.write$(command, () =>
        this.messagesService.error(
          `Error de comunicación puesto [${standNumber}]`
        )
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
      const standBlock = `P${standNumber}`;
      const command = this.buildCommand(
        standBlock,
        SoftwareCalculatorCommands.RESET
      );
      return this.write$(command, () =>
        this.messagesService.error(
          `Error de comunicación puesto [${standNumber}]`
        )
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
  ): Observable<number[]> {
    const observables = activeStands.map((activeStand) => {
      const standNumber = (activeStand.index + 1).toString().padStart(2, '0');
      const standBlock = `P${standNumber}`;
      const pattern = patternConstant.toString().padStart(10, '0');
      const pulses = stepMeterPulses.toString().padStart(5, '0');
      const meterConstant = this.getMeterConstantBlock(
        stepMeterConstant,
        activeStand.stand
      );
      const command = this.buildCommand(
        standBlock,
        SoftwareCalculatorCommands.RESULT_TS01,
        pattern,
        pulses,
        meterConstant
      );
      return this.write$(command, () =>
        this.messagesService.error(
          `Error de comunicación puesto [${standNumber}]`
        )
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

  resultsTS02$(activeStands: ActiveStand[]): Observable<number[]> {
    const observables = activeStands.map((activeStand) => {
      const standNumber = (activeStand.index + 1).toString().padStart(2, '0');
      const standBlock = `P${standNumber}`;
      const command = this.buildCommand(
        standBlock,
        SoftwareCalculatorCommands.RESULT_TS02
      );
      return this.write$(command, () =>
        this.messagesService.error(
          `Error de comunicación puesto [${standNumber}]`
        )
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

  private mapTSxxResponse(commands: string[]): number[] {
    return commands.map((command) => {
      const blocks = CommandDirector.getBlocks(command);
      const resultBlock = blocks[4];
      let resultValue = Number(resultBlock.substring(4));
      const resultSignal = resultBlock.substring(3, 4);
      if (resultSignal === '-') {
        resultValue = resultValue * -1;
      }

      const decimals = Math.pow(10, this.resultDecimalsQuantity);
      return Math.round((resultValue / decimals) * decimals) / decimals;
    });
  }

  private getMeterConstantBlock(
    stepMeterConstant: MeterConstantEnum,
    stand: Stand
  ): string {
    const getStartChar = (
      standConstantUnit: MeterConstantUnitEnum
    ): 'I' | 'W' => {
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
      value = meterConstantValue.padStart(7, '0');
    }
    // 3 enteros y 4 decimales
    if (startChart === 'W') {
      value = this.formatNumberWithPadding(meterConstantValue);
    }
    return `${startChart}${value}`;
  }

  // 3 enteros y 4 decimales
  private formatNumberWithPadding(meterConstantValue: string): string {
    // Separar la parte entera y decimal
    const parts = meterConstantValue.split('.');
    let integerPart = parts[0];
    let decimalPart = parts[1] || '0';

    // Rellenar con ceros a la izquierda
    integerPart = integerPart.padStart(3, '0');
    decimalPart = decimalPart.padEnd(4, '0');

    // Concatenar y devolver el resultado
    return integerPart + decimalPart;
  }
}
