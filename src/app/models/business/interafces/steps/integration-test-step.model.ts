import { EssayTemplateStep } from '../../../../models/business/database/essay-template-step.model';
import { Steps } from '../../../../models/business/enums/steps.model';
import { MeterConstantEnum } from '../../../../models/business/constants/meter-constant.model';
import { Phase } from '../../../../models/business/interafces/phase.model';
import { FormBuilder, Validators } from '@angular/forms';
import { AbstractFormGroup } from '../../../core/abstract-form-group.model';
import { AbstractStepFormBuilder } from '../../class/step-form-builder.model';
import { StandResult } from '../stand-result.model';
import { EssayStep } from '../essay-step.model';
import { ResultStatus } from '../../enums/result-status.model';
import { StepStatus } from '../../enums/step-status.model';
import { PhotocellAdjustmentStatus } from '../../enums/photocell-adjustment-status.model';
import { APP_CONFIG } from '../../../../../environments/environment';

export interface IntegrationTestFormControlRaw {
    name: string;
    meterConstant: MeterConstantEnum;
    phaseL1: Phase;
    phaseL2: Phase;
    phaseL3: Phase;
    durationPulses: number;
    maxAllowedError: number;
}

export interface IntegrationTestStep extends EssayTemplateStep {
    step_id: Steps.IntegrationTest;
    form_control_raw: IntegrationTestFormControlRaw;
}

export interface IntegrationTestStandResult extends StandResult {
    measuredPulses: number;
    measuredError: number;
}

export type IntegrationTestEssayStep = IntegrationTestStep &
    Omit<EssayStep, 'form_control_raw'> & {
        standResults: IntegrationTestStandResult[];
    };

export class IntegrationTestFormBuilder extends AbstractStepFormBuilder<IntegrationTestStep, IntegrationTestEssayStep> {
    override build(fb: FormBuilder): IntegrationTestFormBuilder {
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
                    voltage: [undefined, [Validators.required.bind(this), Validators.min(0), Validators.max(500)]],
                    current: [undefined, [Validators.required.bind(this), Validators.min(0), Validators.max(200)]],
                    anglePhi: [undefined, [Validators.min(0), Validators.max(359.9)]],
                    powerFactor: [undefined, [Validators.required.bind(this), Validators.min(-1), Validators.max(1)]],
                    powerFactorLetter: [undefined, [Validators.required.bind(this)]]
                }),
                phaseL2: fb.nonNullable.group({
                    voltage: [undefined, [Validators.required.bind(this), Validators.min(0), Validators.max(500)]],
                    current: [undefined, [Validators.required.bind(this), Validators.min(0), Validators.max(200)]],
                    anglePhi: [undefined, [Validators.min(0), Validators.max(359.9)]],
                    powerFactor: [undefined, [Validators.required.bind(this), Validators.min(-1), Validators.max(1)]],
                    powerFactorLetter: [undefined, [Validators.required.bind(this)]]
                }),
                phaseL3: fb.nonNullable.group({
                    voltage: [undefined, [Validators.required.bind(this), Validators.min(0), Validators.max(500)]],
                    current: [undefined, [Validators.required.bind(this), Validators.min(0), Validators.max(200)]],
                    anglePhi: [undefined, [Validators.min(0), Validators.max(359.9)]],
                    powerFactor: [undefined, [Validators.required.bind(this), Validators.min(-1), Validators.max(1)]],
                    powerFactorLetter: [undefined, [Validators.required.bind(this)]]
                }),
                durationPulses: [undefined, [Validators.required.bind(this), Validators.min(0), Validators.max(99999)]],
                maxAllowedError: [undefined, [Validators.required.bind(this), Validators.min(0), Validators.max(99.99)]]
            }),
            foreign: undefined
        }) as AbstractFormGroup<IntegrationTestStep>;

        return this;
    }

    override withExecutionProps(this: IntegrationTestFormBuilder): IntegrationTestFormBuilder {
        const typedForm = this.form as AbstractFormGroup<IntegrationTestStep>;

        this.form = this.fb.nonNullable.group({
            ...typedForm.controls,
            verifiedStatus: [StepStatus.Pending, Validators.required.bind(this)],
            executedStatus: [StepStatus.Pending, Validators.required.bind(this)],
            photocellAdjustmentStatus: [PhotocellAdjustmentStatus.Unknown, Validators.required.bind(this)],
            standResults: this.fb.nonNullable.array(this.buildStandResultsArray(APP_CONFIG.standsQuantity))
        }) as AbstractFormGroup<IntegrationTestEssayStep>;

        return this;
    }

    override withVerificationProps(this: IntegrationTestFormBuilder): IntegrationTestFormBuilder {
        const typedForm = this.form as AbstractFormGroup<IntegrationTestStep>;
        typedForm.get('form_control_raw.name')?.setValidators(Validators.required.bind(this));
        return this;
    }

    // generate stand results array based on APP_CONFIG variable
    private buildStandResultsArray(standsQuantity: number): AbstractFormGroup<IntegrationTestStandResult>[] {
        return Array(standsQuantity)
            .fill(undefined)
            .map(
                (_, index) =>
                    this.fb.nonNullable.group({
                        standIndex: index,
                        measuredPulses: undefined,
                        measuredError: undefined,
                        resultStatus: ResultStatus.Unknown
                    }) as AbstractFormGroup<IntegrationTestStandResult>
            );
    }
}
