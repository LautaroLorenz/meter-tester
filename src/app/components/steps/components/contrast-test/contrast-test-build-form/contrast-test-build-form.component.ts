import { ChangeDetectionStrategy, Component } from '@angular/core';
import { StepBuildFormComponent } from '../../../models/build-steps/step-build-form-component.model';
import { MeterConstants } from '../../../../../models/business/constants/meter-constant.model';
import { ContrastTestStep } from '../../../models/build-steps/contrast-test-step.model';
import { AbstractFormGroup } from '../../../../../models/core/abstract-form-group.model';
import { FormBuilder, Validators } from '@angular/forms';

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
      step_id: [undefined, Validators.required.bind(this)],
      form_control_raw: fb.nonNullable.group({
        meterConstant: [undefined, Validators.required.bind(this)],
        phaseL1: fb.nonNullable.group({
          voltage: [
            undefined,
            [Validators.required.bind(this), Validators.min(0)],
          ],
          current: [
            undefined,
            [Validators.required.bind(this), Validators.min(0)],
          ],
          anglePhi: [
            undefined,
            [Validators.required.bind(this), Validators.min(0)],
          ],
        }),
        phaseL2: fb.nonNullable.group({
          voltage: [
            undefined,
            [Validators.required.bind(this), Validators.min(0)],
          ],
          current: [
            undefined,
            [Validators.required.bind(this), Validators.min(0)],
          ],
          anglePhi: [
            undefined,
            [Validators.required.bind(this), Validators.min(0)],
          ],
        }),
        phaseL3: fb.nonNullable.group({
          voltage: [
            undefined,
            [Validators.required.bind(this), Validators.min(0)],
          ],
          current: [
            undefined,
            [Validators.required.bind(this), Validators.min(0)],
          ],
          anglePhi: [
            undefined,
            [Validators.required.bind(this), Validators.min(0)],
          ],
        }),
        maxAllowedError: [
          undefined,
          [
            Validators.required.bind(this),
            Validators.min(0),
            Validators.max(99.99),
          ],
        ],
        meterPulses: [
          undefined,
          [
            Validators.required.bind(this),
            Validators.min(0),
            Validators.max(999),
          ],
        ],
      }),
      foreign: undefined,
    }) as AbstractFormGroup<ContrastTestStep>;
  }
}
