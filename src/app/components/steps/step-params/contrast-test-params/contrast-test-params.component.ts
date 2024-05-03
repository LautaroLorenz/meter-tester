import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { StepParamsComponent } from '../../../../models/business/class/step-params-component.model';
import { ContrastTestEssayStep } from '../../../../models/business/interafces/steps/contrast-test-step.model';

@Component({
  selector: 'app-contrast-test-params',
  templateUrl: './contrast-test-params.component.html',
  styleUrls: ['./contrast-test-params.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContrastTestParamsComponent extends StepParamsComponent<ContrastTestEssayStep> {
  @Input() showTexts!: boolean;
}
