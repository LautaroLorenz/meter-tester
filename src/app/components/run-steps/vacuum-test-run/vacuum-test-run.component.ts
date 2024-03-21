import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { VacuumTestStep } from '../../../models/business/interafces/steps/vacuum-step.model';
import { CountTimerComponent } from '../../count-timer/count-timer.component';
import { RunEssayService } from '../../../services/run-essay.service';

@Component({
  selector: 'app-vacuum-test-run',
  templateUrl: './vacuum-test-run.component.html',
  styleUrls: ['./vacuum-test-run.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VacuumTestRunComponent implements OnChanges, AfterViewInit {
  @Input() currentStep!: VacuumTestStep;
  @ViewChild('countTimer', { static: true }) countTimer!: CountTimerComponent;

  showCompleteName!: boolean;

  constructor(private readonly runEssayService: RunEssayService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.currentStep) {
      this.showCompleteName = this.getShowCompleteName(
        changes.currentStep.currentValue as VacuumTestStep
      );
    }
  }

  ngAfterViewInit(): void {
    // TODO remover
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

  // TODO: esta logica junto con los parametros se pueden mover a un componente para mostrar tambien en el historial
  private getShowCompleteName(currentStep: VacuumTestStep): boolean {
    return currentStep.foreign.step?.name !== currentStep.form_control_raw.name;
  }
}
