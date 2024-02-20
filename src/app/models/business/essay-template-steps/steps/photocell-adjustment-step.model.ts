// TODO todo esto es un componente
// import {
//   AbstractControl,
//   FormBuilder,
//   FormControl,
//   FormGroup,
//   ValidationErrors,
// } from '@angular/forms';
// import { EssayTemplateStep } from '../../database/essay-template-step.model';
// import {
//   BuildValidator,
//   EssayExecutableStep,
//   EssayExecutableStepValidator,
//   ExecutionValidator,
// } from '../essay-executable-step.model';
// import { Steps } from '../steps.model';

// export interface PhotocellAdjustmentStepFormRaw {
//   userConfirmed: boolean | undefined;
// }

// export interface PhotocellAdjustmentStepForm {
//   userConfirmed: FormControl<boolean | undefined>;
// }

// export class PhotocellAdjustmentStep
//   implements Partial<EssayTemplateStep>, EssayExecutableStep
// {
//   readonly step_id: Steps;
//   private readonly form!: FormGroup<PhotocellAdjustmentStepForm>;

//   constructor(private fb: FormBuilder) {
//     this.step_id = Steps.PhotocellAdjustment;
//   }

//   get form_control_raw(): PhotocellAdjustmentStepFormRaw {
//     return this.form.getRawValue() as PhotocellAdjustmentStepFormRaw;
//   }

//   buildValidator(): BuildValidator {
//     return (form: AbstractControl): ValidationErrors | null => {
//       return {};
//     };
//   }

//   executionValidator(): ExecutionValidator {
//     return (form: AbstractControl): ValidationErrors | null => {
//       return {};
//     };
//   }

//   buildForm(
//     validatorFn: EssayExecutableStepValidator
//   ): FormGroup<PhotocellAdjustmentStepForm> {
//     return this.fb.nonNullable.group<PhotocellAdjustmentStepFormRaw>(
//       {
//         userConfirmed: undefined,
//       },
//       {
//         validators: [validatorFn],
//       }
//     ) as FormGroup<PhotocellAdjustmentStepForm>;
//   }
// }
