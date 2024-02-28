import { FormArray, FormBuilder } from '@angular/forms';
import { EssayTemplateStep } from '../database/essay-template-step.model';
import { AbstractFormGroup } from '../../core/abstract-form-group.model';
import { BuilderByStepId } from './step-builder-by-step-id.model';
import { EssayStep } from '../interafces/essay-step.model';

export class StepsBuilder {
  constructor(private fb: FormBuilder) {}

  buildTemplateSteps<T extends EssayTemplateStep>(
    formArray: FormArray<AbstractFormGroup<T>>,
    steps: T[]
  ): void {
    formArray.clear();
    steps.forEach((templateStep) => {
      this.buildTemplateStep(formArray, templateStep);
    });
  }

  buildTemplateStep<T extends EssayTemplateStep>(
    formArray: FormArray<AbstractFormGroup<T>>,
    templateStep: T
  ): void {
    const templateStepForm: AbstractFormGroup<EssayTemplateStep> =
      BuilderByStepId.build(this.fb, templateStep.step_id);
    templateStepForm.patchValue(templateStep);
    formArray.push(templateStepForm as AbstractFormGroup<T>);
  }

  buildEssaySteps<T extends EssayStep, K extends EssayTemplateStep>(
    formArray: FormArray<AbstractFormGroup<T>>,
    steps: K[]
  ): void {
    formArray.clear();
    steps.forEach((templateStep) => {
      this.buildEssayStep(formArray, templateStep);
    });
  }

  buildEssayStep<T extends EssayStep, K extends EssayTemplateStep>(
    formArray: FormArray<AbstractFormGroup<T>>,
    templateStep: K
  ): void {
    const templateStepForm: AbstractFormGroup<EssayTemplateStep> =
      BuilderByStepId.build(this.fb, templateStep.step_id);
    templateStepForm.patchValue(templateStep);
    formArray.push(templateStepForm as AbstractFormGroup<T>);
  }
}
