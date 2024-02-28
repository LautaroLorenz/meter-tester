import { FormBuilder } from '@angular/forms';
import { EssayTemplateStep } from '../../../../models/business/database/essay-template-step.model';
import { Steps } from '../../../../models/business/enums/steps.model';
import { Stand } from '../../../../models/business/interafces/stand.model';
import { AbstractFormGroup } from '../../../core/abstract-form-group.model';
import { APP_CONFIG } from '../../../../../environments/environment';
import { AbstractStepFormBuilder } from '../../class/step-form-builder.model';

export type PreparationFormControlRaw = Stand[];

export interface PreparationStep extends EssayTemplateStep {
  step_id: Steps.Preparation;
  form_control_raw: PreparationFormControlRaw;
}

export class PreparationFormBuilder extends AbstractStepFormBuilder {
  build<T extends PreparationStep>(
    fb: FormBuilder,
    stepType: Steps
  ): AbstractFormGroup<T> {
    if (stepType !== Steps.Preparation) {
      return this.nextBuilder.build(fb, stepType);
    }

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

    return fb.nonNullable.group({
      id: undefined,
      order: undefined,
      essay_template_id: undefined,
      step_id: undefined,
      form_control_raw: fb.nonNullable.array(StandsGroupArray),
      foreign: undefined,
    }) as AbstractFormGroup<T>;
  }
}
