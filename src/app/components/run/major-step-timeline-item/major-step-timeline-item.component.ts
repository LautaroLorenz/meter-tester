import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { StepStatus } from '../../../models/business/enums/step-status.model';
import { MajorStepsMap } from '../../../models/business/constants/major-steps-constant.model';
import { MajorSteps } from '../../../models/business/enums/major-steps.model';
import { StepStatusColorMap } from '../../../models/business/constants/step-status-color-constant.model';

@Component({
  selector: 'app-major-step-timeline-item',
  templateUrl: './major-step-timeline-item.component.html',
  styleUrls: ['./major-step-timeline-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MajorStepTimelineItemComponent {
  @Input() index!: string;
  @Input() majorStep!: MajorSteps;
  @Input() status!: StepStatus;

  readonly MajorStepsMap = MajorStepsMap;
  readonly StepStatusColorMap = StepStatusColorMap;
}
