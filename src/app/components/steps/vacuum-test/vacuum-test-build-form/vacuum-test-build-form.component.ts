import { ChangeDetectionStrategy, Component } from '@angular/core';
import { StepBuildFormComponent } from '../../../../models/business/class/step-build-form-component.model';
import { AbstractFormGroup } from '../../../../models/core/abstract-form-group.model';
import { FormBuilder } from '@angular/forms';
import { MeterConstants } from '../../../../models/business/constants/meter-constant.model';
import {
  VacuumTestFormBuilder,
  VacuumTestStep,
} from '../../../../models/business/interafces/steps/vacuum-step.model';

@Component({
  selector: 'app-vacuum-test-build-form',
  templateUrl: './vacuum-test-build-form.component.html',
  styleUrls: ['./vacuum-test-build-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VacuumTestBuildFormComponent extends StepBuildFormComponent<VacuumTestStep> {
  readonly MeterConstants = MeterConstants;

  override buildForm(fb: FormBuilder): AbstractFormGroup<VacuumTestStep> {
    return new VacuumTestFormBuilder().build(fb)
      .form as AbstractFormGroup<VacuumTestStep>;
  }
}
