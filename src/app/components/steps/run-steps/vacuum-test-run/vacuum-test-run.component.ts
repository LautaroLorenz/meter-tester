import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import {
  VacuumTestEssayStep,
  VacuumTestStandResult,
} from '../../../../models/business/interafces/steps/vacuum-step.model';
import { CountTimerComponent } from '../../../count-timer/count-timer.component';
import { CalculatorComponent } from '../../../machine/calculator/calculator.component';
import { SoftwareCalculatorCommands } from '../../../../models/business/enums/commands.model';
import { merge, switchMap, tap, finalize } from 'rxjs';
import {
  TC_AlignHorizontal,
  TableColumn,
} from '../../../../models/core/table-column.model';
import { StandStandResult } from '../../../../models/business/interafces/stand-result.model';
import { Stand } from '../../../../models/business/interafces/stand.model';
import { ResultStatus } from '../../../../models/business/enums/result-status.model';
import { TestRunComponent } from '../../../../models/business/class/test-run-component.model';
import { PatternComponent } from '../../../machine/pattern/pattern.component';
import { DeviceStatus } from '../../../../models/business/enums/device-status.model';
import { APP_CONFIG } from '../../../../../environments/environment';

@Component({
  selector: 'app-vacuum-test-run',
  templateUrl: './vacuum-test-run.component.html',
  styleUrls: ['./vacuum-test-run.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VacuumTestRunComponent extends TestRunComponent<VacuumTestEssayStep> {
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
    this.stopRunningStep();
  }

  onCalculatorResults(results: number[]): void {
    // descartar resultados fuera de tiempo
    if (!this.countTimer.isRunning) {
      return;
    }

    // update measuredPulses
    this.getActiveStands().forEach(({ index }) => {
      const result: number = results[index];
      this.runEssayService
        .getStandResult<VacuumTestStandResult>(this.currentStep.id, index)
        .patchValue({ measuredPulses: result });
    });
    this.cd.detectChanges();

    // revisar si algún puesto pasa a estado Falló
    this.checkFailedStatus();
    // si todos los stands activos fallaron, detener ensayo
    if (this.isAllStandsFailed()) {
      this.stopRunningStep();
    }
  }

  restart(): void {
    this.restartResults(ResultStatus.Pending);
    this.canContinue = this.getCanContinue();
    this.startTest();
  }

  override isFailCondition(result: VacuumTestStandResult): boolean {
    const maxAllowedPulses = this.currentStep.form_control_raw.maxAllowedPulses;
    return result.measuredPulses > maxAllowedPulses;
  }

  private stopRunningStep(): void {
    this.countTimer.stop();
    this.pattern.deviceStatus$.next(DeviceStatus.Stopped);
    // revisar si algún puesto pasa a estado Falló
    this.checkFailedStatus();
    // todo lo que no está en estado Falló, pasa a estado Aprobado
    this.setApprovedStatus();
    this.cd.detectChanges();

    this.calculator
      .stop$()
      .pipe(
        finalize(() => {
          // puede continuar al siguiente step si todos los stands activos tienen un estado final (Aprobado o Falló)
          this.canContinue = this.getCanContinue();
          this.cd.detectChanges();
          if (this.canContinue) {
            this.skip();
          }
        })
      )
      .subscribe();
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
            this.currentStep.form_control_raw.meterConstant
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
            // activa el device "patrón" y consultando el estado en loop
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

  private restartResults(resultStatus: ResultStatus): void {
    this.getActiveStands().forEach(({ index }) => {
      this.runEssayService
        .getStandResult<VacuumTestStandResult>(this.currentStep.id, index)
        .patchValue({ resultStatus, measuredPulses: 0 });
    });
    this.cd.detectChanges();
  }

  private skip(): void {
    if (!APP_CONFIG.skipSteps.vacuumTestRun) {
      return;
    }
    this.stepExecutionDone(this.currentStep);
  }
}
