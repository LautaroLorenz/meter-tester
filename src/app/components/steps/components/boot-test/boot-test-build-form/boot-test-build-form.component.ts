import { ChangeDetectionStrategy, Component } from '@angular/core';
import { StepBuildFormComponent } from '../../../../../models/business/class/step-build-form-component.model';
import { FormBuilder } from '@angular/forms';
import { MeterConstants } from '../../../../../models/business/constants/meter-constant.model';
import { AbstractFormGroup } from '../../../../../models/core/abstract-form-group.model';
import {
  BootTestFormBuilder,
  BootTestStep,
} from '../../../../../models/business/interafces/steps/boot-test-step.model';

@Component({
  selector: 'app-boot-test-build-form',
  templateUrl: './boot-test-build-form.component.html',
  styleUrls: ['./boot-test-build-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BootTestBuildFormComponent extends StepBuildFormComponent<BootTestStep> {
  readonly MeterConstants = MeterConstants;

  override buildForm(fb: FormBuilder): AbstractFormGroup<BootTestStep> {
    return new BootTestFormBuilder().build(fb)
      .form as AbstractFormGroup<BootTestStep>;
  }
}
