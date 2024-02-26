import { ChangeDetectionStrategy, Component } from '@angular/core';
import { StepBuildFormComponent } from '../../../models/step-build-form-component.model';
import { MeterConstants } from '../../../../../models/business/constants/meter-constant.model';
import { ContrastTestStep } from '../../../models/steps/contrast-test-step.model';
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
      order: undefined,
      essay_template_id: undefined,
      step_id: [undefined, Validators.required.bind(this)],
      form_control_raw: fb.nonNullable.group({
        name: undefined,
        meterConstant: [undefined, Validators.required.bind(this)],
        phaseL1: fb.nonNullable.group({
          voltage: [
            undefined,
            [
              Validators.required.bind(this),
              Validators.min(0),
              Validators.max(500),
            ],
          ],
          current: [
            undefined,
            [
              Validators.required.bind(this),
              Validators.min(0),
              Validators.max(200),
            ],
          ],
          anglePhi: [
            undefined,
            [
              Validators.required.bind(this),
              Validators.min(0),
              Validators.max(359.9),
            ],
          ],
        }),
        phaseL2: fb.nonNullable.group({
          voltage: [
            undefined,
            [
              Validators.required.bind(this),
              Validators.min(0),
              Validators.max(500),
            ],
          ],
          current: [
            undefined,
            [
              Validators.required.bind(this),
              Validators.min(0),
              Validators.max(200),
            ],
          ],
          anglePhi: [
            undefined,
            [
              Validators.required.bind(this),
              Validators.min(0),
              Validators.max(359.9),
            ],
          ],
        }),
        phaseL3: fb.nonNullable.group({
          voltage: [
            undefined,
            [
              Validators.required.bind(this),
              Validators.min(0),
              Validators.max(500),
            ],
          ],
          current: [
            undefined,
            [
              Validators.required.bind(this),
              Validators.min(0),
              Validators.max(200),
            ],
          ],
          anglePhi: [
            undefined,
            [
              Validators.required.bind(this),
              Validators.min(0),
              Validators.max(359.9),
            ],
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
