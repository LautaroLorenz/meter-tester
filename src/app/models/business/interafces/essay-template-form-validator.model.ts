import {
  AbstractControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { EssayTemplateFormGroup } from './essay-template-form.model';
import { EssayTemplate } from '../database/essay-template.model';
import {
  ErrorCodes,
  concatErrorByCode,
} from '../constants/error-codes-constant.model';

const name = (essayTemplate: Partial<EssayTemplate>): boolean => {
  return !essayTemplate.name || essayTemplate.name.length === 0;
};

// const atLeastOneStep = (steps: EssayTemplateStep[]): boolean => {
//   return steps.length === 0;
// };

// const reportAtEnd = (steps: EssayTemplateStep[]): boolean => {
//   const hasReport = steps.some(
//     ({ step_id }) => step_id === StepIdEnum.ReportStep
//   );
//   const reportIndex = steps.findIndex(
//     ({ step_id }) => step_id === StepIdEnum.ReportStep
//   );
//   return hasReport && reportIndex < steps.length - 1;
// };

export function essayTemplateValidator(): ValidatorFn {
  return (form: AbstractControl): ValidationErrors | null => {
    const formGroup = form as FormGroup<EssayTemplateFormGroup>;
    let errors: ValidationErrors = {};

    const {
      // essayTemplateSteps,
      essayTemplate,
    } = formGroup.controls;
    const essay: Partial<EssayTemplate> = essayTemplate.getRawValue();
    // const steps: EssayTemplateStep[] = essayTemplateSteps.getRawValue();

    if (name(essay)) {
      errors = concatErrorByCode(ErrorCodes.name, errors);
    }

    // if (atLeastOneStep(steps)) {
    //   errors = { ...errors, [EssayErrorCodeEnum.AtLeastOneStep]: EssayErrorMessages[EssayErrorCodeEnum.AtLeastOneStep] };
    // }

    // if (reportAtEnd(steps)) {
    //   errors = { ...errors, [EssayErrorCodeEnum.ReportAtEnd]: EssayErrorMessages[EssayErrorCodeEnum.ReportAtEnd] };
    // }

    return Object.keys(errors) ? errors : null;
  };
}
