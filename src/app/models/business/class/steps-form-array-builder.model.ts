import { AbstractControl, FormArray, FormBuilder, FormControl } from '@angular/forms';
import { EssayTemplateStep } from '../database/essay-template-step.model';
import { BootTestFormBuilder } from '../interafces/steps/boot-test-step.model';
import { ContrastTestFormBuilder } from '../interafces/steps/contrast-test-step.model';
import { PreparationFormBuilder } from '../interafces/steps/preparation-step.model';
import {
  VacuumTestFormBuilder,
  VacuumTestStep,
} from '../interafces/steps/vacuum-step.model';
import { AbstractFormGroup } from '../../core/abstract-form-group.model';
import { EssayVerifiedStep } from '../interafces/essay-verified-step.model';
import { VerifiedStatus } from '../enums/verified-status.model';

export class StepsBuilder {
  // step builders
  private readonly PreparationFormBuilder = new PreparationFormBuilder();
  private readonly VacuumTestFormBuilder = new VacuumTestFormBuilder();
  private readonly ContrastTestFormBuilder = new ContrastTestFormBuilder();
  private readonly BootTestFormBuilder = new BootTestFormBuilder();

  constructor() {
    this.PreparationFormBuilder.setNext(this.VacuumTestFormBuilder)
      .setNext(this.ContrastTestFormBuilder)
      .setNext(this.BootTestFormBuilder);
  }

  buildTemplateStepsFormArray<T extends EssayTemplateStep>(
    formArray: FormArray<AbstractFormGroup<T>>,
    steps: EssayTemplateStep[],
    fb: FormBuilder
  ): FormArray<AbstractFormGroup<T>> {
    steps.forEach((templateStep) => {
      const templateStepForm = this.PreparationFormBuilder.build(
        fb,
        templateStep.step_id
      );
      templateStepForm.patchValue(templateStep);
      formArray.push(templateStepForm as AbstractFormGroup<T>);
    });
    return formArray;
  }

  // withVerifiedStatus<T extends EssayTemplateStep>(
  //   this: FormArray<AbstractFormGroup<T>>,
  //   fb: FormBuilder
  // ): FormArray<AbstractFormGroup<VacuumTestStep & EssayVerifiedStep>> {
  //   // this.controls.forEach((formGroup) => {
  //   //   formGroup.addControl(
  //   //     'verifiedStatus',
  //   //     fb.nonNullable.control(VerifiedStatus.Pending) as FormControl<VerifiedStatus>
  //   //   );
  //   // });

  //   // return this;
  // }
}
