import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { EssayTemplateStep } from '../database/essay-template-step.model';
import { AbstractFormGroup } from '../../core/abstract-form-group.model';
import { VerifiedStatus } from '../enums/verified-status.model';
import { BuilderByStepId } from './step-builder-by-step-id.model';
import { ExecutedStatus } from '../enums/executed-status.model';

export class StepsBuilder {
  private formArray!: FormArray<FormGroup>;
  private steps!: EssayTemplateStep[];

  constructor(private fb: FormBuilder) {}

  buildTemplateSteps<T extends EssayTemplateStep>(
    formArray: FormArray,
    steps: EssayTemplateStep[]
  ): StepsBuilder {
    this.formArray = formArray;
    this.steps = steps;

    steps.forEach((templateStep) => {
      const templateStepForm = BuilderByStepId.build(
        this.fb,
        templateStep.step_id
      );
      templateStepForm.patchValue(templateStep);
      formArray.push(templateStepForm as AbstractFormGroup<T>);
    });

    return this;
  }

  withVerifiedStatus(): StepsBuilder {
    this.formArray.controls.forEach((formGroup: FormGroup) => {
      formGroup.addControl(
        'verifiedStatus',
        this.fb.nonNullable.control(VerifiedStatus.Pending)
      );
    });

    return this;
  }

  withExecutedStatus(): StepsBuilder {
    this.formArray.controls.forEach((formGroup: FormGroup) => {
      formGroup.addControl(
        'executedStatus',
        this.fb.nonNullable.control(ExecutedStatus.Pending)
      );
    });

    return this;
  }

  // TODO se tiene que crear un objeto con resultados para cada stand.
  withStandResults(): StepsBuilder {
    this.formArray.controls.forEach((formGroup: FormGroup) => {
      formGroup.addControl('standResults', this.fb.nonNullable.array([]));
    });

    return this;
  }
}
