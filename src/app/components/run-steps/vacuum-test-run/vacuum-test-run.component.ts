import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { VacuumTestStep } from '../../../models/business/interafces/steps/vacuum-step.model';

@Component({
  selector: 'app-vacuum-test-run',
  templateUrl: './vacuum-test-run.component.html',
  styleUrls: ['./vacuum-test-run.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VacuumTestRunComponent implements OnChanges {
  @Input() currentStep!: VacuumTestStep;

  showCompleteName!: boolean;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.currentStep) {
      this.showCompleteName = this.getShowCompleteName(
        changes.currentStep.currentValue as VacuumTestStep
      );
    }
  }

  private getShowCompleteName(currentStep: VacuumTestStep): boolean {
    return currentStep.foreign.step?.name !== currentStep.form_control_raw.name;
  }
}
