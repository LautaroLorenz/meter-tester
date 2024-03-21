import {
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewChild,
} from '@angular/core';
import { VacuumTestStep } from '../../../models/business/interafces/steps/vacuum-step.model';
import { CountTimerComponent } from '../../count-timer/count-timer.component';

@Component({
  selector: 'app-vacuum-test-run',
  templateUrl: './vacuum-test-run.component.html',
  styleUrls: ['./vacuum-test-run.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VacuumTestRunComponent {
  @Input() currentStep!: VacuumTestStep;
  @ViewChild('countTimer', { static: true }) countTimer!: CountTimerComponent;

  isManualGeneratorAdjusted = false;

  manualGeneratorAdjusted(): void {
    this.isManualGeneratorAdjusted = true;

    // TODO: aca se inializa el "loop" si el usuario toca en repetir paso.
    // FIXME no inicializar el timer acá
    this.startTimer();
  }

  timerStop(): void {
    // TODO mostrar resultados
    // this.runEssayService
    //   .getEssayStep(this.currentStep.id)
    //   .get('executedStatus')
    //   ?.setValue(StepStatus.Done);
  }

  private startTimer(): void {
    this.countTimer.start();
  }
}
