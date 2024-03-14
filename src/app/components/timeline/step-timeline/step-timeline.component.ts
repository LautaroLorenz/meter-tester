import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { EssayStep } from '../../../models/business/interafces/essay-step.model';

@Component({
  selector: 'app-step-timeline',
  templateUrl: './step-timeline.component.html',
  styleUrls: ['./step-timeline.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepTimelineComponent {
  @Input() withIndex!: boolean;
  @Input() essaySteps!: EssayStep[];
  @Input() statusProp!: keyof EssayStep;
}
