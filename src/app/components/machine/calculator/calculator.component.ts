import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MachineDeviceComponent } from '../../../models/business/class/machine-device.model';
import { Devices } from '../../../models/business/enums/devices.model';
import { SoftwareCalculatorCommands } from '../../../models/business/enums/commands.model';
import { Observable, of, switchMap, tap } from 'rxjs';
import { Stand } from '../../../models/business/interafces/stand.model';
import { MeterConstantEnum } from '../../../models/business/constants/meter-constant.model';
import { DeviceStatus } from '../../../models/business/enums/device-status.model';
import { StandMeterConstantPipe } from '../../../pipes/business/stand-meter-constant.pipe';

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
    const stands: string[] = preparationStepStands.map(
      (stand, index) =>
        `PS${this.standIndex(index)}${this.standConstant(
          stand,
          stepMeterConstant
        )}`
    );
    return of(this.buildCommand(...stepParamBlocks, ...stands)).pipe(
      tap(() => this.deviceStatus$.next(DeviceStatus.StartInProgress)),
      switchMap((startCommand) => this.write$(startCommand)),
      tap(() => this.deviceStatus$.next(DeviceStatus.Working))
    );
  }

  results$(): Observable<string> {
    return this.loopWrite$(
      this.buildCommand(SoftwareCalculatorCommands.RESULTS),
      this.loopDelay,
      () => this.deviceStatus$.value === DeviceStatus.Working
    );
  }

  private standIndex(index: number) {
    return (index + 1).toString().padStart(2, '0');
  }

  private standConstant(
    stand: Stand,
    stepMeterConstant: MeterConstantEnum
  ): string {
    const offStandConstant = 'xxxxx';
    if (!stand.isActive) {
      return offStandConstant;
    }
    return this.standMeterConstantPipe
      .transform(stepMeterConstant, stand.meter, 'OnlyValue')
      .padStart(offStandConstant.length, '0');
  }
}
