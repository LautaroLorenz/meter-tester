import { EssayTemplateStep } from '../../../../models/business/database/essay-template-step.model';
import { Steps } from '../../../../models/business/enums/steps.model';
import { MeterConstant } from '../../../../models/business/constants/meter-constant.model';
import { Phase } from '../../../../models/business/interafces/phase.model';
import { FormBuilder, Validators } from '@angular/forms';
import { AbstractFormGroup } from '../../../core/abstract-form-group.model';
import { AbstractStepFormBuilder } from '../../class/step-form-builder.model';
import { StandResult } from '../stand-result.model';
import { EssayStep } from '../essay-step.model';
import { VerifiedStatus } from '../../enums/verified-status.model';
import { ExecutedStatus } from '../../enums/executed-status.model';
import { APP_CONFIG } from '../../../../../environments/environment';
import { ResultStatus } from '../../enums/result-status.model';

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

export interface VacuumTestStandResult extends StandResult {
  measuredPulses: number;
}

export type VacuumTestEssayStep = VacuumTestStep &
  EssayStep & {
    standResults: VacuumTestStandResult[];
  };

export class VacuumTestFormBuilder extends AbstractStepFormBuilder<
  VacuumTestStep,
  VacuumTestEssayStep
> {
  build(fb: FormBuilder): VacuumTestFormBuilder {
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
    }) as AbstractFormGroup<VacuumTestStep>;

    return this;
  }

  override withExecutionProps(
    this: VacuumTestFormBuilder
  ): VacuumTestFormBuilder {
    const typedForm = this.form as AbstractFormGroup<VacuumTestStep>;

    this.form = this.fb.nonNullable.group({
      ...typedForm.controls,
      verifiedStatus: [VerifiedStatus.Pending, Validators.required.bind(this)],
      executedStatus: [ExecutedStatus.Pending, Validators.required.bind(this)],
      standResults: this.fb.nonNullable.array(
        this.buildStandResultsArray(APP_CONFIG.standsQuantiy)
      ),
    }) as AbstractFormGroup<VacuumTestEssayStep>;

    return this;
  }

  // generate stand results array based on APP_CONFIG variable
  private buildStandResultsArray(
    standsQuantiy: number
  ): AbstractFormGroup<VacuumTestStandResult>[] {
    return Array(standsQuantiy)
      .fill(undefined)
      .map(
        (_, index) =>
          this.fb.nonNullable.group({
            standIndex: index,
            measuredPulses: undefined,
            resultStatus: ResultStatus.Unknown,
          }) as AbstractFormGroup<VacuumTestStandResult>
      );
  }
}
