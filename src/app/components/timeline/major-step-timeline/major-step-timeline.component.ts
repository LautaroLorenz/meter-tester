import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { EssayStep } from '../../../models/business/interafces/essay-step.model';
import { MajorSteps } from '../../../models/business/enums/major-steps.model';
import { StepStatus } from '../../../models/business/enums/step-status.model';
import { MajorStepsDirector } from '../../../models/business/class/major-steps.model';

@Component({
  selector: 'app-major-step-timeline',
  templateUrl: './major-step-timeline.component.html',
  styleUrls: ['./major-step-timeline.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MajorStepTimelineComponent implements OnChanges {
  @Input() majorStepStatusMap!: Record<MajorSteps, StepStatus> | null;
  @Input() essaySteps!: EssayStep[];

  readonly MajorSteps = MajorSteps;

  verificationSteps!: EssayStep[];
  executionSteps!: EssayStep[];
  preparationStep!: EssayStep;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.essaySteps) {
      this.verificationSteps = MajorStepsDirector.stepsByMajorStep(
        changes.essaySteps.currentValue as EssayStep[],
        MajorSteps.Verification
      );
      this.preparationStep = MajorStepsDirector.stepsByMajorStep(
        changes.essaySteps.currentValue as EssayStep[],
        MajorSteps.Preparation
      )?.[0];
      this.executionSteps = MajorStepsDirector.stepsByMajorStep(
        changes.essaySteps.currentValue as EssayStep[],
        MajorSteps.Execution
      );
    }
  }
}
