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
import { tap, switchMap, merge } from 'rxjs';
import { DeviceStatus } from '../../../../models/business/enums/device-status.model';
import { PatternStatus } from '../../../../models/business/interafces/pattern-status.model';
import { SoftwareCalculatorCommands } from '../../../../models/business/enums/commands.model';

@Component({
  selector: 'app-contrast-test-run',
  templateUrl: './contrast-test-run.component.html',
  styleUrls: ['./contrast-test-run.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContrastTestRunComponent extends TestRunComponent<ContrastTestEssayStep> {
  @ViewChild('calculator', { static: true }) calculator!: CalculatorComponent;
  @ViewChild('pattern', { static: true }) pattern!: PatternComponent;

  stepRunMode = StepRunMode.continuousResultUpdate;

  override readonly skipEnabled = APP_CONFIG.skipSteps.contrastTestRun;

  readonly StepRunModes: EnumAsOption[] = this.EnumAsOptionPipe.transform(
    'StepRunMode',
    StepRunMode
  );

  onManualGeneratorAdjusted(): void {
    this.startTest();
  }

  // TODO
  onCalculatorResults(results: number[]): void {
    console.log(results);
    // // descartar resultados fuera de tiempo
    // if (!this.countTimerMax.isRunning) {
    //   return;
    // }
    // // update measuredPulses
    // this.getActiveStands().forEach(({ index }) => {
    //   const result: number = results[index];
    //   this.runEssayService
    //     .getStandResult<BootTestStandResult>(this.currentStep.id, index)
    //     .patchValue({ measuredPulses: result });
    // });
    // this.cd.detectChanges();
    // // revisar si algún puesto pasa a estado Falló
    // this.checkFailedStatus();
    // // si todos los stands activos fallaron, detener ensayo
    // if (this.isAllStandsFailed()) {
    //   this.stopTest();
    // }
  }

  // TODO
  override isFailCondition(result: ContrastTestStandResult): boolean {
    return false;
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

  // TODO
  override stopTest(): void {
    console.log('stop');
  }

  // TODO
  override restartResults(resultStatus: ResultStatus): void {
    console.log('re-start');
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
