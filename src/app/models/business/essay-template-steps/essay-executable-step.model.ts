import { FormGroup, ValidatorFn } from '@angular/forms';

export type BuildValidator = ValidatorFn;
export type ExecutionValidator = ValidatorFn;
export type EssayExecutableStepValidator = BuildValidator | ExecutionValidator;

export interface EssayExecutableStep {
  buildValidator: BuildValidator;
  // TODO
  // executionValidator: ExecutionValidator;
  buildForm(validatorFn: BuildValidator | ExecutionValidator): FormGroup;
}
