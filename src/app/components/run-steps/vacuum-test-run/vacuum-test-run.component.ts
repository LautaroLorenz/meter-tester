import {
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewChild,
} from '@angular/core';
import { VacuumTestStep } from '../../../models/business/interafces/steps/vacuum-step.model';
import { CountTimerComponent } from '../../count-timer/count-timer.component';
import { CalculatorComponent } from '../../machine/calculator/calculator.component';
import { SoftwareCalculatorCommands } from '../../../models/business/enums/commands.model';
import { switchMap, tap } from 'rxjs';
import { PreparationStep } from '../../../models/business/interafces/steps/preparation-step.model';

@Component({
  selector: 'app-vacuum-test-run',
  templateUrl: './vacuum-test-run.component.html',
  styleUrls: ['./vacuum-test-run.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VacuumTestRunComponent {
  @Input() currentStep!: VacuumTestStep;
  @Input() preparationStep!: PreparationStep;
  @ViewChild('countTimer', { static: true }) countTimer!: CountTimerComponent;
  @ViewChild('calculator', { static: true }) calculator!: CalculatorComponent;

  manualGeneratorAdjusted(): void {
    this.startTest();
  }

  timerStop(): void {
    this.checkEndConditions();
  }

  calculatorResults(results: string): void {
    console.log('results', results);
    // TODO actualizar formulario de resultados

    this.checkEndConditions();
  }

  private checkEndConditions(): void {
    if (!this.countTimer.isRunning) {
      this.calculator.stop$().subscribe();
    }
  }

  private markStepAsDone(): void {
    // TODO
  }

  private startTest(): void {
    this.countTimer.reset();
    this.calculator
      .stop$()
      .pipe(
        switchMap(() =>
          // TODO en el start falta enviar kp (10) |  Xs (8)
          this.calculator.start$(
            SoftwareCalculatorCommands.START_VACUUM,
            this.preparationStep.form_control_raw,
            this.currentStep.form_control_raw.meterConstant
          )
        ),
        tap(() => this.countTimer.start()),
        switchMap(() => this.calculator.results$()),
        tap((results) => this.calculatorResults(results))
      )
      .subscribe();
  }
}
