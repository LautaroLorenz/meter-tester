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
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-vacuum-test-run',
  templateUrl: './vacuum-test-run.component.html',
  styleUrls: ['./vacuum-test-run.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VacuumTestRunComponent {
  @Input() currentStep!: VacuumTestStep;
  @ViewChild('countTimer', { static: true }) countTimer!: CountTimerComponent;
  @ViewChild('calculator', { static: true }) calculator!: CalculatorComponent;

  manualGeneratorAdjusted(): void {
    this.startTest();
  }

  timerStop(): void {
    // TODO se llegó al fin del temporizador
    // this.runEssayService
    //   .getEssayStep(this.currentStep.id)
    //   .get('executedStatus')
    //   ?.setValue(StepStatus.Done);
  }

  private startTest(): void {
    this.calculator
      .stop$()
      .pipe(
        switchMap(() =>
          this.calculator.start$(SoftwareCalculatorCommands.START_VACUUM)
        )
      )
      .subscribe();
  }

  // podria ser un forkJoin del check de todos
  private checkMachineDeviceStatus(): void {
    // TODO revisar el status de los componentes
  }
}
