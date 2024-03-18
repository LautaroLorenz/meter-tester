import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { MajorSteps } from '../../../models/business/enums/major-steps.model';
import { StepStatus } from '../../../models/business/enums/step-status.model';
import { EssayStep } from '../../../models/business/interafces/essay-step.model';

@Component({
  selector: 'app-major-step-switch',
  templateUrl: './major-step-switch.component.html',
  styleUrls: ['./major-step-switch.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MajorStepSwitchComponent implements OnChanges {
  @Input() majorStepStatusMap!: Record<MajorSteps, StepStatus> | null;
  @Input() essaySteps!: EssayStep[];

  currentMajorStep!: MajorSteps | undefined;

  readonly MajorSteps = MajorSteps;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.majorStepStatusMap?.currentValue) {
      this.currentMajorStep = this.getCurrentMajorStep(
        changes.majorStepStatusMap.currentValue as Record<
          MajorSteps,
          StepStatus
        >
      );
    }
  }

  private getCurrentMajorStep(
    majorStepStatusMap: Record<MajorSteps, StepStatus>
  ): MajorSteps {
    const [currentMajorStep] =
      Object.entries(majorStepStatusMap).find(
        ([, stepStatus]) => stepStatus === StepStatus.Current
      ) || [];
    return currentMajorStep as MajorSteps;
  }
}
