import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VacuumTestStep } from '../../../models/steps/vacuum-step.model';
import { StepBuildFormComponent } from '../../../models/step-build-form-component.model';
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
      step_id: [undefined, Validators.required.bind(this)],
      form_control_raw: fb.nonNullable.group({
        meterConstant: [undefined, Validators.required.bind(this)],
        phaseL1: fb.nonNullable.group({
          voltage: [
            undefined,
            [Validators.required.bind(this), Validators.min(0)],
          ],
        }),
        phaseL2: fb.nonNullable.group({
          voltage: [
            undefined,
            [Validators.required.bind(this), Validators.min(0)],
          ],
        }),
        phaseL3: fb.nonNullable.group({
          voltage: [
            undefined,
            [Validators.required.bind(this), Validators.min(0)],
          ],
        }),
        maxAllowedPulses: [
          undefined,
          [
            Validators.required.bind(this),
            Validators.min(0),
            Validators.max(99),
          ],
        ],
        durationSeconds: [
          undefined,
          [
            Validators.required.bind(this),
            Validators.min(0),
            Validators.max(9999),
          ],
        ],
      }),
      foreign: undefined,
    }) as AbstractFormGroup<VacuumTestStep>;
  }
}
