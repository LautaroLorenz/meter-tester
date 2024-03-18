import { FormBuilder } from '@angular/forms';
import { AbstractFormGroup } from '../../core/abstract-form-group.model';
import { EssayTemplateStep } from '../database/essay-template-step.model';
import { EssayStep } from '../interafces/essay-step.model';

export interface StepFormBuilder<
  T extends EssayTemplateStep,
  K extends Partial<EssayStep>
> {
  form: AbstractFormGroup<T> | AbstractFormGroup<K>;
  fb: FormBuilder;

  build(fb: FormBuilder): StepFormBuilder<T, K>;

  withExecutionProps(this: StepFormBuilder<T, K>): StepFormBuilder<T, K>;

  withVerificationProps(this: StepFormBuilder<T, K>): StepFormBuilder<T, K>;
}

export abstract class AbstractStepFormBuilder<
  T extends EssayTemplateStep,
  K extends Partial<EssayStep>
> implements StepFormBuilder<T, K>
{
  form!: AbstractFormGroup<T> | AbstractFormGroup<K>;
  fb!: FormBuilder;
  abstract build(fb: FormBuilder): StepFormBuilder<T, K>;
  abstract withExecutionProps(
    this: StepFormBuilder<T, K>
  ): StepFormBuilder<T, K>;
  abstract withVerificationProps(
    this: StepFormBuilder<T, K>
  ): StepFormBuilder<T, K>;
}
