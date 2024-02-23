import { ChangeDetectionStrategy, Component } from '@angular/core';
import { StepBuildFormComponent } from '../../../models/step-build-form-component.model';
import { BootTestStep } from '../../../models/steps/boot-test-step.model';
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
