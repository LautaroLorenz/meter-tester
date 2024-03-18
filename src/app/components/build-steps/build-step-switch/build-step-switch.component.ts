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
  selector: 'app-build-step-switch',
  templateUrl: './build-step-switch.component.html',
  styleUrls: ['./build-step-switch.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BuildStepSwitchComponent {
  @Input() essayTemplateStep: EssayTemplateStep | undefined;
  @Input() isVerification!: boolean;

  @Output() formValidChange = new EventEmitter<boolean>();
  @Output() formValueChange = new EventEmitter<EssayTemplateStep>();

  readonly Steps = Steps;
}
