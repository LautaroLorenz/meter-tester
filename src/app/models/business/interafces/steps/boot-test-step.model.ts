import { EssayTemplateStep } from '../../../../models/business/database/essay-template-step.model';
import { Steps } from '../../../../models/business/enums/steps.model';
import { MeterConstant } from '../../../../models/business/constants/meter-constant.model';
import { Phase } from '../../../../models/business/interafces/phase.model';
import { AbstractFormGroup } from '../../../core/abstract-form-group.model';
import { FormBuilder, Validators } from '@angular/forms';
import { AbstractStepFormBuilder } from '../../class/step-form-builder.model';
import { EssayStep } from '../essay-step.model';
import { StandResult } from '../stand-result.model';
import { APP_CONFIG } from '../../../../../environments/environment';
import { ResultStatus } from '../../enums/result-status.model';
import { StepStatus } from '../../enums/step-status.model';

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

export interface BootTestStandResult extends StandResult {
  measuredPulses: number;
}

export type BootTestEssayStep = BootTestStep &
  EssayStep & {
    standResults: BootTestStandResult[];
  };

export class BootTestFormBuilder extends AbstractStepFormBuilder<
  BootTestStep,
  BootTestEssayStep
> {
  override build(fb: FormBuilder): BootTestFormBuilder {
    this.fb = fb;
    this.form = fb.nonNullable.group({
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

    return this;
  }

  override withExecutionProps(this: BootTestFormBuilder): BootTestFormBuilder {
    const typedForm = this.form as AbstractFormGroup<BootTestStep>;

    this.form = this.fb.nonNullable.group({
      ...typedForm.controls,
      verifiedStatus: [StepStatus.Pending, Validators.required.bind(this)],
      executedStatus: [StepStatus.Pending, Validators.required.bind(this)],
      standResults: this.fb.nonNullable.array(
        this.buildStandResultsArray(APP_CONFIG.standsQuantiy)
      ),
    }) as AbstractFormGroup<BootTestEssayStep>;

    return this;
  }

  override withVerificationProps(
    this: BootTestFormBuilder
  ): BootTestFormBuilder {
    const typedForm = this.form as AbstractFormGroup<BootTestStep>;
    typedForm
      .get('form_control_raw.name')
      ?.setValidators(Validators.required.bind(this));
    return this;
  }

  // generate stand results array based on APP_CONFIG variable
  private buildStandResultsArray(
    standsQuantiy: number
  ): AbstractFormGroup<BootTestStandResult>[] {
    return Array(standsQuantiy)
      .fill(undefined)
      .map(
        (_, index) =>
          this.fb.nonNullable.group({
            standIndex: index,
            measuredPulses: undefined,
            resultStatus: ResultStatus.Unknown,
          }) as AbstractFormGroup<BootTestStandResult>
      );
  }
}
