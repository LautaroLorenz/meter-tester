import { EssayTemplateStep } from '../../../models/business/database/essay-template-step.model';
import { EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';

export interface StepBuildForm<T extends EssayTemplateStep> {
  formValidChange: EventEmitter<boolean>;
  formValueChange: EventEmitter<T>;
  essayTemplateStep: T;
  form: FormGroup;
  onDestroy: Subject<void>;
  buildForm(): FormGroup;
  patchInitValue(): void;
}
