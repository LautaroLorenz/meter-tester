import { FormControl, FormGroup } from '@angular/forms';
import { EssayTemplateStep } from '../../../models/business/database/essay-template-step.model';
import { Steps } from '../../../models/business/enums/steps.model';
import { EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';

export interface StepBuildForm<T extends EssayTemplateStep> {
  formValidChange: EventEmitter<boolean>;
  formValueChange: EventEmitter<Partial<T>>;
  stepId: Steps;
  essayTemplateStep: T;
  form: FormGroup<{
    [Property in keyof T]: FormControl<T[Property] | undefined>;
  }>;
  onDestroy: Subject<void>;
  buildForm(): FormGroup<{
    [Property in keyof T]: FormControl<T[Property] | undefined>;
  }>;
}
