import { ChangeDetectionStrategy, Component } from '@angular/core';
import { StepBuildFormComponent } from '../../../../../models/business/class/step-build-form-component.model';
import { MeterConstants } from '../../../../../models/business/constants/meter-constant.model';
import { AbstractFormGroup } from '../../../../../models/core/abstract-form-group.model';
import { FormBuilder } from '@angular/forms';
import {
  ContrastTestFormBuilder,
  ContrastTestStep,
} from '../../../../../models/business/interafces/steps/contrast-test-step.model';
import { Steps } from '../../../../../models/business/enums/steps.model';

@Component({
  selector: 'app-contrast-test-build-form',
  templateUrl: './contrast-test-build-form.component.html',
  styleUrls: ['./contrast-test-build-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContrastTestBuildFormComponent extends StepBuildFormComponent<ContrastTestStep> {
  readonly MeterConstants = MeterConstants;

  override buildForm(fb: FormBuilder): AbstractFormGroup<ContrastTestStep> {
    return new ContrastTestFormBuilder().build(fb, Steps.ContrastTest);
  }
}
