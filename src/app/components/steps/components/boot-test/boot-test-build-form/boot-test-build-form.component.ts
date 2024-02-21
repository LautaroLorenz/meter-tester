import { ChangeDetectionStrategy, Component } from '@angular/core';
import { StepBuildFormComponent } from '../../../models/step-build-form-component.model';
import {
  BootTestStep,
  BootTestStepFormGroup,
} from './models/boot-test-step.model';
import { FormBuilder } from '@angular/forms';
import { MeterConstants } from '../../../../../models/business/constants/meter-constant.model';

@Component({
  selector: 'app-boot-test-build-form',
  templateUrl: './boot-test-build-form.component.html',
  styleUrls: ['./boot-test-build-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BootTestBuildFormComponent extends StepBuildFormComponent<
  BootTestStep,
  BootTestStepFormGroup
> {
  readonly MeterConstants = MeterConstants;

  override buildForm(fb: FormBuilder): BootTestStepFormGroup {
    return fb.nonNullable.group({
      id: undefined,
      name: undefined,
      order: undefined,
      essay_template_id: undefined,
      step_id: undefined,
      form_control_raw: fb.nonNullable.group({
        meterConstant: undefined,
        phaseL1: fb.nonNullable.group({
          voltage: undefined,
          current: undefined,
          anglePhi: undefined,
        }),
        phaseL2: fb.nonNullable.group({
          voltage: undefined,
          current: undefined,
          anglePhi: undefined,
        }),
        phaseL3: fb.nonNullable.group({
          voltage: undefined,
          current: undefined,
          anglePhi: undefined,
        }),
        allowedPulses: undefined,
        minDurationSeconds: undefined,
        maxDurationSeconds: undefined,
      }),
      foreign: undefined,
    }) as BootTestStepFormGroup;
  }
}
