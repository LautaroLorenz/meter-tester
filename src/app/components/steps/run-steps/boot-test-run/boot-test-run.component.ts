import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { TestRunComponent } from '../../../../models/business/class/test-run-component.model';
import {
  BootTestEssayStep,
  BootTestStandResult,
} from '../../../../models/business/interafces/steps/boot-test-step.model';
import { CountTimerComponent } from '../../../count-timer/count-timer.component';
import { CalculatorComponent } from '../../../machine/calculator/calculator.component';
import { PatternComponent } from '../../../machine/pattern/pattern.component';
import { tap, switchMap, finalize, forkJoin } from 'rxjs';
import { SoftwareCalculatorCommands } from '../../../../models/business/enums/commands.model';
import { ResultStatus } from '../../../../models/business/enums/result-status.model';
import {
  TC_AlignHorizontal,
  TableColumn,
} from '../../../../models/core/table-column.model';
import { StandStandResult } from '../../../../models/business/interafces/stand-result.model';
import { Stand } from '../../../../models/business/interafces/stand.model';
import { merge } from 'rxjs/internal/observable/merge';
import { DeviceStatus } from '../../../../models/business/enums/device-status.model';
import { APP_CONFIG } from '../../../../../environments/environment';

@Component({
  selector: 'app-boot-test-run',
  templateUrl: './boot-test-run.component.html',
  styleUrls: ['./boot-test-run.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BootTestRunComponent extends TestRunComponent<BootTestEssayStep> {
  @ViewChild('countTimerMin', { static: true })
  countTimerMin!: CountTimerComponent;
  @ViewChild('countTimerMax', { static: true })
  countTimerMax!: CountTimerComponent;
  @ViewChild('calculator', { static: true }) calculator!: CalculatorComponent;
  @ViewChild('pattern', { static: true }) pattern!: PatternComponent;

  readonly resultsColumn: TableColumn<StandStandResult> = {
    alignHorizontal: TC_AlignHorizontal.Number,
    header: 'Impulsos',
    field: (item: StandStandResult): string => {
      const realItem = item as Stand | BootTestStandResult;
      return 'measuredPulses' in realItem
        ? realItem.measuredPulses?.toString()
        : '';
    },
  };

  override readonly skipEnabled = APP_CONFIG.skipSteps.bootTestRun;

  onManualGeneratorAdjusted(): void {
    this.startTest();
  }

  onMinTimerCountdownFinish(): void {
    // revisar si algún puesto pasa a estado Falló
    this.checkFailedStatus();
    // si todos los stands activos fallaron, detener ensayo
    if (this.isAllStandsFailed()) {
      this.stopTest();
    }
  }

  onMaxTimerCountdownFinish(): void {
    this.stopTest();
  }

  onCalculatorResults(results: number[]): void {
    // descartar resultados fuera de tiempo
    if (!this.countTimerMax.isRunning) {
      return;
    }
    // update measuredPulses
    this.getActiveStands().forEach(({ index }) => {
      const result: number = results[index];
      this.runEssayService
        .getStandResult<BootTestStandResult>(this.currentStep.id, index)
        .patchValue({ measuredPulses: result });
    });
    this.cd.detectChanges();

    // revisar si algún puesto pasa a estado Falló
    this.checkFailedStatus();
    // si todos los stands activos fallaron, detener ensayo
    if (this.isAllStandsFailed()) {
      this.stopTest();
    }
  }

  override isFailCondition(result: BootTestStandResult): boolean {
    // Condición de corte por tiempo mínimo:
    // la cantidad de impulsos se iguala o supera antes de cumplir el tiempo mínimo.
    if (this.countTimerMin.isRunning) {
      if (
        result.measuredPulses >= this.currentStep.form_control_raw.allowedPulses
      ) {
        return true;
      }
    }
    // Condición de corte por tiempo máximo:
    // la cantidad de impulsos no iguala ni supera a la mínima y no queda más tiempo.
    if (!this.countTimerMax.isRunning) {
      if (
        result.measuredPulses < this.currentStep.form_control_raw.allowedPulses
      ) {
        return true;
      }
    }
    return false;
  }

  override startTest(): void {
    // recetea el contador
    this.countTimerMin.reset();
    this.countTimerMax.reset();

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
        tap(() => {
          this.countTimerMin.start();
          this.countTimerMax.start();
        }),
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

  override stopTest(): void {
    // detener contadores
    this.countTimerMin.stop();
    this.countTimerMax.stop();
    // apagar dispositivos
    forkJoin({
      // apagar patrón
      pattern: this.pattern.stop$(),
      // apagar calculador
      calculator: this.calculator.stop$(),
    })
      .pipe(
        finalize(() => {
          // Puede continuar al siguiente step si todos los stands activos tienen
          // un estado final (Aprobado o Falló)
          this.canContinue = this.getCanContinue();
          this.cd.detectChanges();
          if (this.canContinue) {
            this.skip();
          }
        })
      )
      .subscribe();
    // revisar si algún puesto pasa a estado Falló
    this.checkFailedStatus();
    // todo lo que no está en estado Falló, pasa a estado Aprobado
    this.setApprovedStatus();
    this.cd.detectChanges();
  }

  override restartResults(resultStatus: ResultStatus): void {
    this.getActiveStands().forEach(({ index }) => {
      this.runEssayService
        .getStandResult<BootTestStandResult>(this.currentStep.id, index)
        .patchValue({ resultStatus, measuredPulses: 0 });
    });
    this.cd.detectChanges();
  }

  private getStepCalculatorBlocks(): string[] {
    const stepTypeBlock = SoftwareCalculatorCommands.START_BOOT;
    const patternConstantBlock = ''.padStart(10, '0');
    const allowedPulsesBlock: string =
      this.currentStep.form_control_raw.allowedPulses
        .toString()
        .padStart(8, '0');

    return [stepTypeBlock, patternConstantBlock, allowedPulsesBlock];
  }
}
