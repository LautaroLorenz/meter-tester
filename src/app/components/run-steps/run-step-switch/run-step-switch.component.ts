import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { EssayStep } from '../../../models/business/interafces/essay-step.model';
import { Steps } from '../../../models/business/enums/steps.model';

@Component({
  selector: 'app-run-step-switch',
  templateUrl: './run-step-switch.component.html',
  styleUrls: ['./run-step-switch.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RunStepSwitchComponent {
  @Input() currentStep!: EssayStep;

  readonly Steps = Steps;
}
