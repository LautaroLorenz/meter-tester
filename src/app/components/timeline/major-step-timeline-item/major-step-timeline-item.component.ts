import {
  ChangeDetectionStrategy,
  Component,
  Input,
  TemplateRef,
} from '@angular/core';
import { StepStatus } from '../../../models/business/enums/step-status.model';
import { MajorStepsMap } from '../../../models/business/constants/major-steps-constant.model';
import { MajorSteps } from '../../../models/business/enums/major-steps.model';

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
  @Input() bodyTemplate: TemplateRef<any> | undefined;

  readonly MajorStepsMap = MajorStepsMap;

  get isCurrent(): boolean {
    return this.status === StepStatus.Current;
  }

  get isDone(): boolean {
    return this.status === StepStatus.Done;
  }

  get isPending(): boolean {
    return this.status === StepStatus.Pending;
  }
}
