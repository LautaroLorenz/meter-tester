import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { EssayStep } from '../../models/business/interafces/essay-step.model';
import { MajorSteps } from '../../models/business/enums/major-steps.model';
import { StepStatus } from '../../models/business/enums/step-status.model';

@Component({
  selector: 'app-major-step-timeline',
  templateUrl: './major-step-timeline.component.html',
  styleUrls: ['./major-step-timeline.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MajorStepTimelineComponent {
  @Input() marjorStepStatus!: Record<MajorSteps, StepStatus>;
  @Input() essaySteps!: EssayStep[];

  readonly MajorSteps = MajorSteps;
}
