import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { MajorSteps } from '../../../models/business/enums/major-steps.model';
import { StepStatus } from '../../../models/business/enums/step-status.model';

@Component({
  selector: 'app-major-step-switch',
  templateUrl: './major-step-switch.component.html',
  styleUrls: ['./major-step-switch.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MajorStepSwitchComponent implements OnChanges {
  @Input() marjorStepStatus!: Record<MajorSteps, StepStatus>;

  currentMajorStep!: MajorSteps | undefined;

  readonly MajorSteps = MajorSteps;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.marjorStepStatus.currentValue) {
      this.currentMajorStep = this.getCurrentMajorStep(
        changes.marjorStepStatus.currentValue as Record<MajorSteps, StepStatus>
      );
    }
  }

  private getCurrentMajorStep(
    marjorStepStatus: Record<MajorSteps, StepStatus>
  ): MajorSteps {
    const [currentMajorStep] =
      Object.entries(marjorStepStatus).find(
        ([, stepStatus]) => stepStatus === StepStatus.Current
      ) || [];
    return currentMajorStep as MajorSteps;
  }
}
