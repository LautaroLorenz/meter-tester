import {
  AbstractControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { EssayTemplateForm } from './essay-template-form.model';
import { EssayTemplate } from '../../available-test/models/essay-template.model';

export enum EssayErrorCodeEnum {
  name = 'name',
  //   AtLeastOneStep = 'AtLeastOneStep',
  //   ReportAtEnd = 'ReportAtEnd',
}
export type EssayErrorCode = EssayErrorCodeEnum;

export const EssayErrorMessages: Record<
  EssayErrorCode,
  { code: string; message: string }
> = {
  [EssayErrorCodeEnum.name]: {
    code: 'Nombre',
    message: 'Debes ingresar un nombre de ensayo',
  },
  //   [EssayErrorCodeEnum.AtLeastOneStep]: {
  //     code: 'Requerido',
  //     message: 'El ensayo debe contener al menos un paso',
  //   },
  //   [EssayErrorCodeEnum.ReportAtEnd]: {
  //     code: 'Finalizar con reporte',
  //     message: 'El reporte debe ocurrir al final',
  //   },
};

const name = (essayTemplate: EssayTemplate): boolean => {
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
    const formGroup = form as FormGroup<EssayTemplateForm>;
    let errors: ValidationErrors = {};

    const {
      // essayTemplateSteps,
      essayTemplate,
    } = formGroup.controls;
    const essay: EssayTemplate = essayTemplate.getRawValue();
    // const steps: EssayTemplateStep[] = essayTemplateSteps.getRawValue();

    if (name(essay)) {
      errors = {
        ...errors,
        [EssayErrorCodeEnum.name]: EssayErrorMessages[EssayErrorCodeEnum.name],
      };
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
