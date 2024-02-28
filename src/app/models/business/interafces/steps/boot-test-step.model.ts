import { EssayTemplateStep } from '../../../../models/business/database/essay-template-step.model';
import { Steps } from '../../../../models/business/enums/steps.model';
import { MeterConstant } from '../../../../models/business/constants/meter-constant.model';
import { Phase } from '../../../../models/business/interafces/phase.model';
import { AbstractFormGroup } from '../../../core/abstract-form-group.model';
import { FormBuilder, Validators } from '@angular/forms';
import { AbstractStepFormBuilder } from '../../class/step-form-builder.model';

export interface BootTestFormControlRaw {
  name: string;
  meterConstant: MeterConstant;
  phaseL1: Phase;
  phaseL2: Phase;
  phaseL3: Phase;
  allowedPulses: number;
  minDurationSeconds: number;
  maxDurationSeconds: number;
}

export interface BootTestStep extends EssayTemplateStep {
  step_id: Steps.BootTest;
  form_control_raw: BootTestFormControlRaw;
}

export class BootTestFormBuilder extends AbstractStepFormBuilder {
  override build<T extends BootTestStep>(
    fb: FormBuilder,
    stepType: Steps
  ): AbstractFormGroup<T> {
    if (stepType !== Steps.BootTest) {
      return this.nextBuilder.build(fb, stepType);
    }

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
    }) as AbstractFormGroup<T>;
  }
}
