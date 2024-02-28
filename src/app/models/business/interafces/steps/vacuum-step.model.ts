import { EssayTemplateStep } from '../../../../models/business/database/essay-template-step.model';
import { Steps } from '../../../../models/business/enums/steps.model';
import { MeterConstant } from '../../../../models/business/constants/meter-constant.model';
import { Phase } from '../../../../models/business/interafces/phase.model';
import { FormBuilder, Validators } from '@angular/forms';
import { AbstractFormGroup } from '../../../core/abstract-form-group.model';
import { AbstractStepFormBuilder } from '../../class/step-form-builder.model';

export interface VacuumTestFormControlRaw {
  name: string;
  meterConstant: MeterConstant;
  phaseL1: Pick<Phase, 'voltage'>;
  phaseL2: Pick<Phase, 'voltage'>;
  phaseL3: Pick<Phase, 'voltage'>;
  maxAllowedPulses: number;
  durationSeconds: number;
}

export interface VacuumTestStep extends EssayTemplateStep {
  step_id: Steps.VacuumTest;
  form_control_raw: VacuumTestFormControlRaw;
}

export class VacuumTestFormBuilder extends AbstractStepFormBuilder {
  build<T extends EssayTemplateStep>(
    fb: FormBuilder,
    stepType: Steps
  ): AbstractFormGroup<T> {
    if (stepType !== Steps.VacuumTest) {
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
    }) as AbstractFormGroup<VacuumTestStep> as AbstractFormGroup<T>;
  }
}
