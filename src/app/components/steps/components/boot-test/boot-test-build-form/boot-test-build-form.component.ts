import { ChangeDetectionStrategy, Component } from '@angular/core';
import { StepBuildFormComponent } from '../../../../../models/business/class/step-build-form-component.model';
import { FormBuilder, Validators } from '@angular/forms';
import { MeterConstants } from '../../../../../models/business/constants/meter-constant.model';
import { AbstractFormGroup } from '../../../../../models/core/abstract-form-group.model';
import { BootTestStep } from '../../../../../models/business/interafces/steps/boot-test-step.model';

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
        allowedPulses: [
          undefined,
          [
            Validators.required.bind(this),
            Validators.min(0),
            Validators.max(99),
          ],
        ],
        minDurationSeconds: [
          undefined,
          [
            Validators.required.bind(this),
            Validators.min(0),
            Validators.max(9999),
          ],
        ],
        maxDurationSeconds: [
          undefined,
          [
            Validators.required.bind(this),
            Validators.min(0),
            Validators.max(9999),
          ],
        ],
      }),
      foreign: undefined,
    }) as AbstractFormGroup<BootTestStep>;
  }
}
