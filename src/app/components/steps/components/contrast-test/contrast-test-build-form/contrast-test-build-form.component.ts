import { ChangeDetectionStrategy, Component } from '@angular/core';
import { StepBuildFormComponent } from '../../../models/build-steps/step-build-form-component.model';
import { MeterConstants } from '../../../../../models/business/constants/meter-constant.model';
import { ContrastTestStep } from '../../../models/build-steps/contrast-test-step.model';
import { AbstractFormGroup } from '../../../../../models/core/abstract-form-group.model';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-contrast-test-build-form',
  templateUrl: './contrast-test-build-form.component.html',
  styleUrls: ['./contrast-test-build-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContrastTestBuildFormComponent extends StepBuildFormComponent<ContrastTestStep> {
  readonly MeterConstants = MeterConstants;

  override buildForm(fb: FormBuilder): AbstractFormGroup<ContrastTestStep> {
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
        maxAllowedError: undefined,
        meterPulses: undefined,
      }),
      foreign: undefined,
    }) as AbstractFormGroup<ContrastTestStep>;
  }
}
