import { FormBuilder } from '@angular/forms';
import { Steps } from '../enums/steps.model';
import { AbstractFormGroup } from '../../core/abstract-form-group.model';
import { EssayTemplateStep } from '../database/essay-template-step.model';

export interface StepFormBuilder {
  setNext(handler: StepFormBuilder): StepFormBuilder;
  build<T extends EssayTemplateStep>(
    fb: FormBuilder,
    stepType: Steps
  ): AbstractFormGroup<T>;
}

export abstract class AbstractStepFormBuilder implements StepFormBuilder {
  protected nextBuilder!: StepFormBuilder;

  setNext(handler: StepFormBuilder): StepFormBuilder {
    this.nextBuilder = handler;
    return handler;
  }

  abstract build<T extends EssayTemplateStep>(
    fb: FormBuilder,
    stepType: Steps
  ): AbstractFormGroup<T>;
}
