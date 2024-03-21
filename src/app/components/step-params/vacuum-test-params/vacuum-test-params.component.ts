import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { VacuumTestStep } from '../../../models/business/interafces/steps/vacuum-step.model';

@Component({
  selector: 'app-vacuum-test-params',
  templateUrl: './vacuum-test-params.component.html',
  styleUrls: ['./vacuum-test-params.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VacuumTestParamsComponent implements OnChanges {
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
