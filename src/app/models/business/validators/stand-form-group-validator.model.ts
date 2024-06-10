import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { AbstractFormGroup } from '../../core/abstract-form-group.model';
import { Stand } from '../interafces/stand.model';
import { ErrorCodes, concatErrorByCode } from '../constants/error-codes-constant.model';

const isActive = (standFormGroup: AbstractFormGroup<Stand>): boolean => {
    const { meter_id, serialNumber, yearOfProduction, isActive } = standFormGroup.getRawValue();
    if (isActive === true) {
        if (!meter_id || !serialNumber || !yearOfProduction) {
            return true;
        }
    }
    return false;
};

export function standFormGroupValidator(): ValidatorFn {
    return (form: AbstractControl): ValidationErrors | null => {
        const standFormGroup = form as AbstractFormGroup<Stand>;
        let errors: ValidationErrors = {};

        if (isActive(standFormGroup)) {
            errors = concatErrorByCode(ErrorCodes.standIsActive, errors);
        }

        return Object.keys(errors) ? errors : null;
    };
}
