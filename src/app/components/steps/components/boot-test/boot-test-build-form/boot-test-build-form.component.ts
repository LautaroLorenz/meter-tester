import { ChangeDetectionStrategy, Component } from '@angular/core';
import { StepBuildFormComponent } from '../../../models/build-steps/step-build-form-component.model';
import { BootTestStep } from '../../../models/build-steps/boot-test-step.model';
import { FormBuilder, Validators } from '@angular/forms';
import { MeterConstants } from '../../../../../models/business/constants/meter-constant.model';
import { AbstractFormGroup } from '../../../../../models/core/abstract-form-group.model';

@Component({
  selector: 'app-boot-test-build-form',
  templateUrl: './boot-test-build-form.component.html',
  styleUrls: ['./boot-test-build-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BootTestBuildFormComponent extends StepBuildFormComponent<BootTestStep> {
  readonly MeterConstants = MeterConstants;

  override buildForm(fb: FormBuilder): AbstractFormGroup<BootTestStep> {
    return fb.nonNullable.group({
      id: undefined,
      name: undefined,
      order: undefined,
      essay_template_id: undefined,
      step_id: [undefined, Validators.required.bind(this)],
      form_control_raw: fb.nonNullable.group({
        meterConstant: [undefined, Validators.required.bind(this)],
        phaseL1: fb.nonNullable.group({
          voltage: [undefined, Validators.required.bind(this)],
          current: [undefined, Validators.required.bind(this)],
          anglePhi: [undefined, Validators.required.bind(this)],
        }),
        phaseL2: fb.nonNullable.group({
          voltage: [undefined, Validators.required.bind(this)],
          current: [undefined, Validators.required.bind(this)],
          anglePhi: [undefined, Validators.required.bind(this)],
        }),
        phaseL3: fb.nonNullable.group({
          voltage: [undefined, Validators.required.bind(this)],
          current: [undefined, Validators.required.bind(this)],
          anglePhi: [undefined, Validators.required.bind(this)],
        }),
        allowedPulses: [undefined, Validators.required.bind(this)],
        minDurationSeconds: [undefined, [Validators.required.bind(this), Validators.min(0)]],
        maxDurationSeconds: [undefined, Validators.required.bind(this)],
      }),
      foreign: undefined,
    }) as AbstractFormGroup<BootTestStep>;
  }
}
