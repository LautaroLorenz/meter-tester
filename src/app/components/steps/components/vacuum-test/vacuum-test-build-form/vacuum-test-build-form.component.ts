import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VacuumTestStep } from '../../../models/build-steps/vacuum-step.model';
import { StepBuildFormComponent } from '../../../models/build-steps/step-build-form-component.model';
import { AbstractFormGroup } from '../../../../../models/core/abstract-form-group.model';
import { FormBuilder, Validators } from '@angular/forms';
import { MeterConstants } from '../../../../../models/business/constants/meter-constant.model';

@Component({
  selector: 'app-vacuum-test-build-form',
  templateUrl: './vacuum-test-build-form.component.html',
  styleUrls: ['./vacuum-test-build-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VacuumTestBuildFormComponent extends StepBuildFormComponent<VacuumTestStep> {
  readonly MeterConstants = MeterConstants;

  override buildForm(fb: FormBuilder): AbstractFormGroup<VacuumTestStep> {
    return fb.nonNullable.group({
      id: undefined,
      name: undefined,
      order: undefined,
      essay_template_id: undefined,
      step_id: undefined,
      form_control_raw: fb.nonNullable.group({
        meterConstant: [undefined, Validators.required.bind(this)],
        phaseL1: fb.nonNullable.group({
          voltage: undefined,
        }),
        phaseL2: fb.nonNullable.group({
          voltage: undefined,
        }),
        phaseL3: fb.nonNullable.group({
          voltage: undefined,
        }),
        maxAllowedPulses: [undefined, Validators.required.bind(this)],
        durationSeconds: [undefined, Validators.required.bind(this)],
      }),
      foreign: undefined,
    }) as AbstractFormGroup<VacuumTestStep>;
  }
}
