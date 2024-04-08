import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { TestRunComponent } from '../../../../models/business/class/test-run-component.model';
import { BootTestEssayStep } from '../../../../models/business/interafces/steps/boot-test-step.model';
import { CountTimerComponent } from '../../../count-timer/count-timer.component';
import { CalculatorComponent } from '../../../machine/calculator/calculator.component';
import { PatternComponent } from '../../../machine/pattern/pattern.component';
import { tap, switchMap } from 'rxjs';
import { SoftwareCalculatorCommands } from '../../../../models/business/enums/commands.model';

@Component({
  selector: 'app-boot-test-run',
  templateUrl: './boot-test-run.component.html',
  styleUrls: ['./boot-test-run.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BootTestRunComponent extends TestRunComponent<BootTestEssayStep> {
  @ViewChild('countTimer', { static: true }) countTimer!: CountTimerComponent;
  @ViewChild('calculator', { static: true }) calculator!: CalculatorComponent;
  @ViewChild('pattern', { static: true }) pattern!: PatternComponent;

  onManualGeneratorAdjusted(): void {
    this.startTest();
  }

  onTimerCountdownFinish(): void {
    // this.stopRunningStep();
  }

  // TODO
  override isFailCondition(): boolean {
    return false;
  }

  // TODO
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
        // TODO
        // // cambia el estado de los resultados
        // tap(() => this.restartResults(ResultStatus.WorkInProgress)),
        // inicializa el contador
        tap(() => this.countTimer.start())
        // TODO
        // // inicializa el patrón
        // tap(() => this.pattern.deviceStatus$.next(DeviceStatus.Working)),
        // switchMap(() =>
        //   merge(
        //     // activa el device "patrón" y consultando el estado en loop
        //     this.pattern.loopStatus$(),

        //     // consulta resultados del calculador en loop
        //     this.calculator
        //       .loopResults$()
        //       .pipe(tap((results) => this.onCalculatorResults(results)))
        //   )
        // )
      )
      .subscribe();
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
