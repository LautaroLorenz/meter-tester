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
  }

  private startTimer(): void {
    this.countTimer.start();
  }

  private getShowCompleteName(currentStep: VacuumTestStep): boolean {
    return currentStep.foreign.step?.name !== currentStep.form_control_raw.name;
  }
}
