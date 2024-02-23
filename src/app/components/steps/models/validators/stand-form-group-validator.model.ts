import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { AbstractFormGroup } from '../../../../models/core/abstract-form-group.model';
import { Stand } from '../../../../models/business/interafces/stand.model';
import {
  ErrorCodes,
  concatErrorByCode,
} from '../../../../models/business/constants/error-codes-constant.model';

const isActive = (standFormGroup: AbstractFormGroup<Stand>): boolean => {
  if (standFormGroup.get('isActive')?.value === true) {
    const { meterId, serialNumber, yearOfProduction } =
      standFormGroup.getRawValue();
    if (!meterId || !serialNumber || !yearOfProduction) {
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
