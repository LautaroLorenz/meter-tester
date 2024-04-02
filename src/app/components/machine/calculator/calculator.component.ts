import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MachineDeviceComponent } from '../../../models/business/class/machine-device.model';
import { Devices } from '../../../models/business/enums/devices.model';
import { SoftwareCalculatorCommands } from '../../../models/business/enums/commands.model';
import { Observable, map, of, switchMap, tap } from 'rxjs';
import { Stand } from '../../../models/business/interafces/stand.model';
import { MeterConstantEnum } from '../../../models/business/constants/meter-constant.model';
import { DeviceStatus } from '../../../models/business/enums/device-status.model';
import { StandMeterConstantPipe } from '../../../pipes/business/stand-meter-constant.pipe';
import { APP_CONFIG } from '../../../../environments/environment';
import { CommandDirector } from '../../../models/business/class/command-director.model';

@Component({
  selector: 'app-calculator',
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalculatorComponent extends MachineDeviceComponent {
  override readonly device = Devices.CAL;

  readonly standMeterConstantPipe = inject(StandMeterConstantPipe);

  stop$(): Observable<string> {
    return of(this.buildCommand(SoftwareCalculatorCommands.STOP)).pipe(
      tap(() => this.deviceStatus$.next(DeviceStatus.StopInProgress)),
      switchMap((stopCommand) => this.write$(stopCommand)),
      tap(() => this.deviceStatus$.next(DeviceStatus.Stopped))
    );
  }

  start$(
    stepParamBlocks: string[],
    preparationStepStands: Stand[],
    stepMeterConstant: MeterConstantEnum
  ): Observable<string> {
    // para los stands que tiene la máquina completamos el comando según puesto activo/inactivo
    const standBlocks: string[] = preparationStepStands.map(
      (stand, index) =>
        `PS${this.standIndex(index)}${this.standConstant(
          stand,
          stepMeterConstant
        )}`
    );

    // cunado la máquina tiene menos stands que los de la logitud del comando
    // completamos la longitud del comando con puestos apagados.
    let padBlockQuantity =
      APP_CONFIG.commandStandsQuantity - standBlocks.length;
    const padStandBlocks = [];
    while (padBlockQuantity > 0) {
      const index = APP_CONFIG.commandStandsQuantity - padBlockQuantity;
      padStandBlocks.push(`PS${this.standIndex(index)}${this.standConstant()}`);
      padBlockQuantity--;
    }

    return of(
      this.buildCommand(...stepParamBlocks, ...standBlocks, ...padStandBlocks)
    ).pipe(
      tap(() => this.deviceStatus$.next(DeviceStatus.StartInProgress)),
      switchMap((startCommand) => this.write$(startCommand)),
      tap(() => this.deviceStatus$.next(DeviceStatus.Working))
    );
  }

  results$(): Observable<number[]> {
    return this.loopWrite$(
      this.buildCommand(SoftwareCalculatorCommands.RESULTS),
      this.loopDelay,
      () => this.deviceStatus$.value === DeviceStatus.Working
    ).pipe(map((response) => this.extractNumbersFromResultsCommand(response)));
  }

  private extractNumbersFromResultsCommand(resultCommand: string): number[] {
    const blocks = CommandDirector.getBlocks(resultCommand);
    const allResultsBlock = blocks.filter((block) => block.includes('PS'));
    const resultsBlock = allResultsBlock.filter(
      (_, index) => index < APP_CONFIG.standsQuantiy
    );
    return resultsBlock.map((block) => Number(block.substring(4)));
  }

  private standIndex(index: number) {
    return (index + 1).toString().padStart(2, '0');
  }

  private standConstant(
    stand?: Stand,
    stepMeterConstant?: MeterConstantEnum
  ): string {
    const offStandConstant = 'xxxxx';
    if (!stand || !stepMeterConstant) {
      return offStandConstant;
    }
    if (!stand.isActive) {
      return offStandConstant;
    }
    return this.standMeterConstantPipe
      .transform(stepMeterConstant, stand.meter, 'OnlyValue')
      .padStart(offStandConstant.length, '0');
  }
}
