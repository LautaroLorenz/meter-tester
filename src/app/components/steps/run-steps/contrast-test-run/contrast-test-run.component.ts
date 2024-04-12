import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { TestRunComponent } from '../../../../models/business/class/test-run-component.model';
import {
  ContrastTestEssayStep,
  ContrastTestStandResult,
} from '../../../../models/business/interafces/steps/contrast-test-step.model';
import { ResultStatus } from '../../../../models/business/enums/result-status.model';
import { APP_CONFIG } from '../../../../../environments/environment';
import { StepRunMode } from '../../../../models/business/enums/step-run-mode';
import { EnumAsOption } from '../../../../models/core/enum-as-option.model';
import { CalculatorComponent } from '../../../machine/calculator/calculator.component';
import { PatternComponent } from '../../../machine/pattern/pattern.component';
import { tap, switchMap, merge, finalize, forkJoin } from 'rxjs';
import { DeviceStatus } from '../../../../models/business/enums/device-status.model';
import { PatternStatus } from '../../../../models/business/interafces/pattern-status.model';
import { SoftwareCalculatorCommands } from '../../../../models/business/enums/commands.model';
import {
  TC_AlignHorizontal,
  TableColumn,
} from '../../../../models/core/table-column.model';
import { StandStandResult } from '../../../../models/business/interafces/stand-result.model';
import { Stand } from '../../../../models/business/interafces/stand.model';

@Component({
  selector: 'app-contrast-test-run',
  templateUrl: './contrast-test-run.component.html',
  styleUrls: ['./contrast-test-run.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContrastTestRunComponent extends TestRunComponent<ContrastTestEssayStep> {
  @ViewChild('calculator', { static: true }) calculator!: CalculatorComponent;
  @ViewChild('pattern', { static: true }) pattern!: PatternComponent;

  override readonly skipEnabled = APP_CONFIG.skipSteps.contrastTestRun;

  stepRunMode = this.skipEnabled
    ? StepRunMode.finalResultLock
    : StepRunMode.continuousResultUpdate;

  readonly StepRunModes: EnumAsOption[] = this.EnumAsOptionPipe.transform(
    'StepRunMode',
    StepRunMode
  );
  readonly resultsColumn: TableColumn<StandStandResult> = {
    alignHorizontal: TC_AlignHorizontal.Number,
    header: 'Error [%]',
    field: (item: StandStandResult): string => {
      const realItem = item as Stand | ContrastTestStandResult;
      return 'measuredError' in realItem
        ? realItem.measuredError?.toString()
        : '';
    },
  };

  onManualGeneratorAdjusted(): void {
    this.startTest();
  }

  onCalculatorResults(results: number[]): void {
    // update measured error
    this.getActiveStands().forEach(({ index }) => {
      const result: number = results[index];
      const stand =
        this.runEssayService.getStandResult<ContrastTestStandResult>(
          this.currentStep.id,
          index
        );
      // bloqueo de resultado actual según modo de ejecución
      if (
        this.stepRunMode === StepRunMode.finalResultLock &&
        stand.getRawValue().resultStatus === ResultStatus.Locked
      ) {
        return;
      }
      // nuevo estado de resulado
      const resultStatus =
        // si llegó un valor diferente del actual
        stand.getRawValue().measuredError !== result &&
        // si el modo es bloqueo de resultado
        this.stepRunMode === StepRunMode.finalResultLock
          ? ResultStatus.Locked
          : ResultStatus.WorkInProgress;

      // actualización de resultado
      stand.patchValue({
        measuredError: result,
        resultStatus,
      });
    });
    this.cd.detectChanges();
    // revisar si el modo de ejecución es bloqueo y todos los stands tienen resultado.
    if (
      this.stepRunMode === StepRunMode.finalResultLock &&
      this.isAllStandsWithResultLocked()
    ) {
      this.stopTest();
    }
  }

  override isFailCondition(result: ContrastTestStandResult): boolean {
    return (
      Math.abs(result.measuredError) >
      this.currentStep.form_control_raw.maxAllowedError
    );
  }

  override startTest(): void {
    // apaga el calculador por si estaba encendido
    this.calculator
      .stop$()
      .pipe(
        // inicializa el patrón
        tap(() =>
          this.pattern.deviceStatus$.next(DeviceStatus.StartInProgress)
        ),
        // consulta la constante del patrón
        switchMap(() =>
          this.pattern
            .constant$(
              this.currentStep.form_control_raw.phaseL1,
              this.currentStep.form_control_raw.phaseL2,
              this.currentStep.form_control_raw.phaseL3
            )
            .pipe(
              tap(() => this.pattern.deviceStatus$.next(DeviceStatus.Working))
            )
        ),
        // enciende el calculador
        switchMap((patternStatus: PatternStatus) =>
          this.calculator.start$(
            this.getStepCalculatorBlocks(patternStatus.constant),
            this.preparationStep.form_control_raw,
            this.currentStep.form_control_raw.meterConstant
          )
        ),
        // cambia el estado de los resultados
        tap(() => this.restartResults(ResultStatus.WorkInProgress)),
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
        .getStandResult<ContrastTestStandResult>(this.currentStep.id, index)
        .patchValue({ resultStatus, measuredError: 0 });
    });
    this.cd.detectChanges();
  }

  private getStepCalculatorBlocks(patternConstant: number): string[] {
    const stepTypeBlock = SoftwareCalculatorCommands.START_CONTRAST;
    const patternConstantBlock = patternConstant.toString().padStart(10, '0');
    const pulsesBlock: string = this.currentStep.form_control_raw.meterPulses
      .toString()
      .padStart(8, '0');

    return [stepTypeBlock, patternConstantBlock, pulsesBlock];
  }
}
