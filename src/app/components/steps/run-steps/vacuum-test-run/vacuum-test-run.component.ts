import {
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewChild,
} from '@angular/core';
import {
  VacuumTestEssayStep,
  VacuumTestStandResult,
} from '../../../../models/business/interafces/steps/vacuum-step.model';
import { CountTimerComponent } from '../../../count-timer/count-timer.component';
import { CalculatorComponent } from '../../../machine/calculator/calculator.component';
import { SoftwareCalculatorCommands } from '../../../../models/business/enums/commands.model';
import { merge, switchMap, tap } from 'rxjs';
import {
  TC_AlignHorizontal,
  TableColumn,
} from '../../../../models/core/table-column.model';
import { StandStandResult } from '../../../../models/business/interafces/stand-result.model';
import { Stand } from '../../../../models/business/interafces/stand.model';
import { ResultStatus } from '../../../../models/business/enums/result-status.model';
import { TestRunComponent } from '../../../../models/business/class/test-run.model';
import { PatternComponent } from '../../../machine/pattern/pattern.component';
import { DeviceStatus } from '../../../../models/business/enums/device-status.model';
import { APP_CONFIG } from '../../../../../environments/environment';
import { MeterConstantEnum } from '../../../../models/business/constants/meter-constant.model';

@Component({
  selector: 'app-vacuum-test-run',
  templateUrl: './vacuum-test-run.component.html',
  styleUrls: ['./vacuum-test-run.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VacuumTestRunComponent extends TestRunComponent {
  @Input() currentStep!: VacuumTestEssayStep;
  @ViewChild('countTimer', { static: true }) countTimer!: CountTimerComponent;
  @ViewChild('calculator', { static: true }) calculator!: CalculatorComponent;
  @ViewChild('pattern', { static: true }) pattern!: PatternComponent;

  canContinue = false;

  readonly resultsColumn: TableColumn<StandStandResult> = {
    alignHorizontal: TC_AlignHorizontal.Number,
    header: 'Impulsos',
    field: (item: StandStandResult): string => {
      const realItem = item as Stand | VacuumTestStandResult;
      return 'measuredPulses' in realItem
        ? realItem.measuredPulses?.toString()
        : '';
    },
  };

  onManualGeneratorAdjusted(): void {
    this.startTest();
  }

  onTimerCountdownFinish(): void {
    this.updateStandsResultStatus();
    this.stopRunningStep();
  }

  onCalculatorResults(results: number[]): void {
    // update measuredPulses
    this.getActiveStands().forEach(({ index }) => {
      const result: number = results[index];
      this.runEssayService
        .getStandResult<VacuumTestStandResult>(this.currentStep.id, index)
        .patchValue({ measuredPulses: result });
    });

    // update result status
    this.updateStandsResultStatus();

    // si todos los stands activos fallaron, detener ensayo
    const isAllActiveStandsFailed = this.getActiveStands().every(
      ({ index }) =>
        this.runEssayService
          .getStandResult<VacuumTestStandResult>(this.currentStep.id, index)
          .getRawValue().resultStatus === ResultStatus.Failed
    );

    if (isAllActiveStandsFailed) {
      this.stopRunningStep();
    }
  }

  restart(): void {
    this.restartResults(ResultStatus.Pending);
    this.canContinue = this.getCanContinue();
    this.startTest();
  }

  private stopRunningStep(): void {
    this.countTimer.stop();
    this.calculator.stop$().subscribe();
    this.pattern.deviceStatus$.next(DeviceStatus.Stopped);

    // puede continuar al siguiente step si todos los stands activos tienen un estado
    this.canContinue = this.getCanContinue();
    this.cd.detectChanges();

    if (this.canContinue) {
      this.skip();
    }
  }

  private onDeactivate(): void {
    // TODO resolver situación cuando el usuario sale de la pantalla
    // TODO esto debería estar en TestRunComponent
  }

  private startTest(): void {
    // recetea el contador
    this.countTimer.reset();

    // apaga el calculador por si estaba encendido
    this.calculator
      .stop$()
      .pipe(
        // enciende el calculador
        switchMap(() =>
          this.calculator.start$(
            this.getStepCalculatorBlocks(),
            this.preparationStep.form_control_raw,
            this.currentStep.form_control_raw.meterConstant as MeterConstantEnum
          )
        ),
        // cambia el estado de los resultados
        tap(() => this.restartResults(ResultStatus.WorkInProgress)),
        // inicializa el contador
        tap(() => this.countTimer.start()),
        // inicializa el patrón
        tap(() => this.pattern.deviceStatus$.next(DeviceStatus.Working)),
        switchMap(() =>
          merge(
            // consulta estado del patrón en loop
            this.pattern.loopStatus$(),

            // consulta resultados del calculador en loop
            this.calculator
              .loopResults$()
              .pipe(tap((results) => this.onCalculatorResults(results)))
          )
        )
      )
      .subscribe();
  }

  private getStepCalculatorBlocks(): string[] {
    const stepTypeBlock = SoftwareCalculatorCommands.START_VACUUM;
    const patternConstantBlock = ''.padStart(10, '0');
    const maxAllowedPulsesBlock: string =
      this.currentStep.form_control_raw.maxAllowedPulses
        .toString()
        .padStart(8, '0');

    return [stepTypeBlock, patternConstantBlock, maxAllowedPulsesBlock];
  }

  private updateStandsResultStatus(): void {
    this.getActiveStands().forEach(({ index }) => {
      const result: VacuumTestStandResult =
        this.currentStep.standResults[index];
      this.runEssayService
        .getStandResult<VacuumTestStandResult>(this.currentStep.id, index)
        .patchValue({
          resultStatus: this.calculateStandStatus(
            result.measuredPulses,
            this.currentStep.form_control_raw.maxAllowedPulses as number
          ),
        });
    });
    this.cd.detectChanges();
  }

  private calculateStandStatus(
    measuredPulses: number,
    maxAllowedPulses: number
  ): ResultStatus {
    if (measuredPulses > maxAllowedPulses) {
      return ResultStatus.Failed;
    }
    if (this.countTimer.isRunning) {
      return ResultStatus.WorkInProgress;
    }
    return ResultStatus.Approved;
  }

  private restartResults(resultStatus: ResultStatus): void {
    this.getActiveStands().forEach(({ index }) => {
      this.runEssayService
        .getStandResult<VacuumTestStandResult>(this.currentStep.id, index)
        .patchValue({ resultStatus, measuredPulses: 0 });
    });
    this.cd.detectChanges();
  }

  private getCanContinue(): boolean {
    return this.getActiveStands().every(({ index }) => {
      const { resultStatus } = this.runEssayService
        .getStandResult<VacuumTestStandResult>(this.currentStep.id, index)
        .getRawValue();
      return (
        resultStatus === ResultStatus.Failed ||
        resultStatus === ResultStatus.Approved
      );
    });
  }

  private skip(): void {
    if (!APP_CONFIG.skipSteps.vacuumTestRun) {
      return;
    }
    this.stepExecutionDone(this.currentStep);
  }
}
