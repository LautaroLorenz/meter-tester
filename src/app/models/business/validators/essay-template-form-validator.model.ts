import { AbstractControl, FormArray, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { EssayTemplateFormGroup } from '../interafces/essay-template-form.model';
import { EssayTemplate } from '../database/essay-template.model';
import { ErrorCodes, concatErrorByCode } from '../constants/error-codes-constant.model';
import { AbstractFormGroup } from '../../core/abstract-form-group.model';
import { EssayTemplateStep } from '../database/essay-template-step.model';
import { Steps } from '../enums/steps.model';

const name = (essayTemplate: Partial<EssayTemplate>): boolean => {
    return !essayTemplate.name || essayTemplate.name.length === 0;
};
const adjustStepParams = (essayTemplateSteps: FormArray<AbstractFormGroup<EssayTemplateStep>>): boolean => {
    const steps = essayTemplateSteps.controls.filter((step) => step.value.step_id !== Steps.Preparation);
    return steps.some((step) => step.invalid);
};

export function essayTemplateValidator(): ValidatorFn {
    return (form: AbstractControl): ValidationErrors | null => {
        const formGroup = form as FormGroup<EssayTemplateFormGroup>;
        let errors: ValidationErrors = {};

        const { essayTemplateSteps, essayTemplate } = formGroup.controls;
        const essay: Partial<EssayTemplate> = essayTemplate.getRawValue();

        if (name(essay)) {
            errors = concatErrorByCode(ErrorCodes.name, errors);
        }
        if (adjustStepParams(essayTemplateSteps)) {
            errors = concatErrorByCode(ErrorCodes.adjustStepParams, errors);
        }

        return Object.keys(errors).length ? errors : null;
    };
}
