import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { Steps } from '../../../models/business/enums/steps.model';
import { EssayTemplateStep } from '../../../models/business/database/essay-template-step.model';

@Component({
  selector: 'app-step-switch',
  templateUrl: './step-switch.component.html',
  styleUrls: ['./step-switch.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepSwitchComponent {
  @Input() essayTemplateStep!: EssayTemplateStep;

  @Output() formValidChange = new EventEmitter<boolean>();
  @Output() formValueChange = new EventEmitter<EssayTemplateStep>();

  readonly Steps = Steps;
}
