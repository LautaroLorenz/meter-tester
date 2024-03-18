import { EssayTemplateStep } from '../../../../models/business/database/essay-template-step.model';
import { Steps } from '../../../../models/business/enums/steps.model';
import { MeterConstant } from '../../../../models/business/constants/meter-constant.model';
import { Phase } from '../../../../models/business/interafces/phase.model';
import { FormBuilder, Validators } from '@angular/forms';
import { AbstractFormGroup } from '../../../core/abstract-form-group.model';
import { AbstractStepFormBuilder } from '../../class/step-form-builder.model';
import { StandResult } from '../stand-result.model';
import { EssayStep } from '../essay-step.model';
import { APP_CONFIG } from '../../../../../environments/environment';
import { ResultStatus } from '../../enums/result-status.model';
import { StepStatus } from '../../enums/step-status.model';

export interface ContrastTestFormControlRaw {
  name: string;
  meterConstant: MeterConstant;
  phaseL1: Phase;
  phaseL2: Phase;
  phaseL3: Phase;
  maxAllowedError: number;
  meterPulses: number;
}

export interface ContrastTestStep extends EssayTemplateStep {
  step_id: Steps.ContrastTest;
  form_control_raw: ContrastTestFormControlRaw;
}

export interface ContrastTestStandResult extends StandResult {
  measuredError: number;
}

export type ContrastTestEssayStep = ContrastTestStep &
  EssayStep & {
    standResults: ContrastTestStandResult[];
  };

export class ContrastTestFormBuilder extends AbstractStepFormBuilder<
  ContrastTestStep,
  ContrastTestEssayStep
> {
  override build(fb: FormBuilder): ContrastTestFormBuilder {
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

    return this;
  }

  override withExecutionProps(
    this: ContrastTestFormBuilder
  ): ContrastTestFormBuilder {
    const typedForm = this.form as AbstractFormGroup<ContrastTestStep>;

    this.form = this.fb.nonNullable.group({
      ...typedForm.controls,
      verifiedStatus: [StepStatus.Pending, Validators.required.bind(this)],
      executedStatus: [StepStatus.Pending, Validators.required.bind(this)],
      standResults: this.fb.nonNullable.array(
        this.buildStandResultsArray(APP_CONFIG.standsQuantiy)
      ),
    }) as AbstractFormGroup<ContrastTestEssayStep>;

    return this;
  }

  override withVerificationProps(
    this: ContrastTestFormBuilder
  ): ContrastTestFormBuilder {
    const typedForm = this.form as AbstractFormGroup<ContrastTestStep>;
    typedForm
      .get('form_control_raw.name')
      ?.setValidators(Validators.required.bind(this));
    return this;
  }

  // generate stand results array based on APP_CONFIG variable
  private buildStandResultsArray(
    standsQuantiy: number
  ): AbstractFormGroup<ContrastTestStandResult>[] {
    return Array(standsQuantiy)
      .fill(undefined)
      .map(
        (_, index) =>
          this.fb.nonNullable.group({
            standIndex: index,
            measuredError: undefined,
            resultStatus: ResultStatus.Unknown,
          }) as AbstractFormGroup<ContrastTestStandResult>
      );
  }
}
