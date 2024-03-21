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

  manualGeneratorAdjusted(): void {
    // TODO: aca se inializa el "loop" si el usuario toca en repetir paso.
    // FIXME no inicializar el timer acá
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
    // this.countTimer.start();
    // TODO check status de todos los componentes (calculador y patrón)

  }

  // podria ser un forkJoin del check de todos
  private checkMachineDeviceStatus(): void {
    // TODO revisar el status de los componentes
  }
}
