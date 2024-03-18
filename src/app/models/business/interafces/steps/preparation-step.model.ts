import { FormBuilder, Validators } from '@angular/forms';
import { EssayTemplateStep } from '../../../../models/business/database/essay-template-step.model';
import { Steps } from '../../../../models/business/enums/steps.model';
import { Stand } from '../../../../models/business/interafces/stand.model';
import { AbstractFormGroup } from '../../../core/abstract-form-group.model';
import { APP_CONFIG } from '../../../../../environments/environment';
import { AbstractStepFormBuilder } from '../../class/step-form-builder.model';
import { EssayStep } from '../essay-step.model';
import { StepStatus } from '../../enums/step-status.model';

export type PreparationFormControlRaw = Stand[];

export interface PreparationStep extends EssayTemplateStep {
  step_id: Steps.Preparation;
  form_control_raw: PreparationFormControlRaw;
}

// export type PreparationEssayStep = PreparationStep & EssayStep;

export type PreparationEssayStep = PreparationStep &
  Pick<EssayStep, 'verifiedStatus'>;

export class PreparationFormBuilder extends AbstractStepFormBuilder<
  PreparationStep,
  PreparationEssayStep
> {
  override build(fb: FormBuilder): PreparationFormBuilder {
    this.fb = fb;

    this.form = fb.nonNullable.group({
      id: undefined,
      order: undefined,
      essay_template_id: undefined,
      step_id: undefined,
      form_control_raw: fb.nonNullable.array(
        this.buildStandsArray(APP_CONFIG.standsQuantiy)
      ),
      foreign: undefined,
    }) as AbstractFormGroup<PreparationStep>;

    return this;
  }

  override withExecutionProps(
    this: PreparationFormBuilder
  ): PreparationFormBuilder {
    const typedForm = this.form as AbstractFormGroup<PreparationStep>;

    this.form = this.fb.nonNullable.group({
      ...typedForm.controls,
      verifiedStatus: [StepStatus.Pending, Validators.required.bind(this)],
    }) as AbstractFormGroup<PreparationEssayStep>;

    return this;
  }

  override withVerificationProps(
    this: PreparationFormBuilder
  ): PreparationFormBuilder {
    return this;
  }

  // generate stand array based on APP_CONFIG variable
  private buildStandsArray(standsQuantiy: number): AbstractFormGroup<Stand>[] {
    return Array(standsQuantiy)
      .fill(undefined)
      .map(
        () =>
          this.fb.nonNullable.group({
            name: undefined,
            isActive: true,
            meterId: undefined,
            serialNumber: undefined,
            yearOfProduction: undefined,
          }) as AbstractFormGroup<Stand>
      );
  }
}
