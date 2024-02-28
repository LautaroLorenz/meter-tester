import { FormBuilder, Validators } from '@angular/forms';
import { EssayTemplateStep } from '../../../../models/business/database/essay-template-step.model';
import { Steps } from '../../../../models/business/enums/steps.model';
import { Stand } from '../../../../models/business/interafces/stand.model';
import { AbstractFormGroup } from '../../../core/abstract-form-group.model';
import { APP_CONFIG } from '../../../../../environments/environment';
import { AbstractStepFormBuilder } from '../../class/step-form-builder.model';
import { EssayStep } from '../essay-step.model';
import { VerifiedStatus } from '../../enums/verified-status.model';

export type PreparationFormControlRaw = Stand[];

export interface PreparationStep extends EssayTemplateStep {
  step_id: Steps.Preparation;
  form_control_raw: PreparationFormControlRaw;
}

export type PreparationEssayStep = PreparationStep & EssayStep;

export class PreparationFormBuilder extends AbstractStepFormBuilder<
  PreparationStep,
  PreparationEssayStep
> {
  build(fb: FormBuilder): PreparationFormBuilder {
    this.fb = fb;
    // generate stand array based on APP_CONFIG variable
    const StandsGroupArray: AbstractFormGroup<Stand>[] = Array(
      APP_CONFIG.standsQuantiy
    )
      .fill(undefined)
      .map(
        () =>
          fb.nonNullable.group({
            name: undefined,
            isActive: true,
            meterId: undefined,
            serialNumber: undefined,
            yearOfProduction: undefined,
          }) as AbstractFormGroup<Stand>
      );

    this.form = fb.nonNullable.group({
      id: undefined,
      order: undefined,
      essay_template_id: undefined,
      step_id: undefined,
      form_control_raw: fb.nonNullable.array(StandsGroupArray),
      foreign: undefined,
    }) as AbstractFormGroup<PreparationStep>;

    return this;
  }

  override withExecutionProps(
    this: PreparationFormBuilder
  ): PreparationFormBuilder {
    this.form = this.fb.nonNullable.group({
      ...this.form.controls,
      verifiedStatus: [VerifiedStatus.Pending, Validators.required.bind(this)],
    }) as unknown as AbstractFormGroup<PreparationEssayStep>;

    return this;
  }
}
