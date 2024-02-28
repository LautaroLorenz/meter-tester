import { FormArray, FormBuilder } from '@angular/forms';
import { EssayTemplateStep } from '../database/essay-template-step.model';
import { AbstractFormGroup } from '../../core/abstract-form-group.model';
import { EssayStep } from '../interafces/essay-step.model';
import { PreparationFormBuilder } from '../interafces/steps/preparation-step.model';
import { VacuumTestFormBuilder } from '../interafces/steps/vacuum-step.model';
import { ContrastTestFormBuilder } from '../interafces/steps/contrast-test-step.model';
import { BootTestFormBuilder } from '../interafces/steps/boot-test-step.model';
import { StepFormBuilder } from './step-form-builder.model';
import { Steps } from '../enums/steps.model';

export class StepsBuilder {
  private builder!: StepFormBuilder<EssayTemplateStep, EssayStep>;

  constructor(private fb: FormBuilder) {}

  buildTemplateSteps<T extends EssayTemplateStep>(
    formArray: FormArray<AbstractFormGroup<T>>,
    steps: T[]
  ): void {
    formArray.clear();
    steps.forEach((templateStep) =>
      this.buildTemplateStep(formArray, templateStep)
    );
  }

  buildTemplateStep<T extends EssayTemplateStep>(
    formArray: FormArray<AbstractFormGroup<T>>,
    templateStep: T
  ): void {
    this.setBuilder(templateStep.step_id);
    this.builder.build(this.fb);
    this.builder.form.patchValue(templateStep);
    formArray.push(this.builder.form as AbstractFormGroup<T>);
  }

  buildEssaySteps<T extends EssayStep, K extends EssayTemplateStep>(
    formArray: FormArray<AbstractFormGroup<T>>,
    steps: K[]
  ): void {
    formArray.clear();
    steps.forEach((templateStep) =>
      this.buildEssayStep(formArray, templateStep)
    );
  }

  buildEssayStep<T extends EssayStep, K extends EssayTemplateStep>(
    formArray: FormArray<AbstractFormGroup<T>>,
    templateStep: K
  ): void {
    this.setBuilder(templateStep.step_id);
    this.builder.build(this.fb).withExecutionProps();
    this.builder.form.patchValue(templateStep);
    formArray.push(this.builder.form as AbstractFormGroup<T>);
  }

  private setBuilder(stepType: Steps): void {
    let builderAny: any;
    switch (stepType) {
      case Steps.Preparation:
        builderAny = new PreparationFormBuilder();
        break;
      case Steps.BootTest:
        builderAny = new BootTestFormBuilder();
        break;
      case Steps.ContrastTest:
        builderAny = new ContrastTestFormBuilder();
        break;
      case Steps.VacuumTest:
        builderAny = new VacuumTestFormBuilder();
        break;
      default:
        throw new Error('Builder not found');
    }
    this.builder = builderAny as StepFormBuilder<EssayTemplateStep, EssayStep>;
  }
}
