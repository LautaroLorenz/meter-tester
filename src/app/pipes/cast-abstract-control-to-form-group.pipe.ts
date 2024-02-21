import { Pipe, PipeTransform } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';

@Pipe({
  name: 'asFormGroup',
})
export class CastAbstractControlToFormGroupPipe implements PipeTransform {
  transform(value: AbstractControl | null): FormGroup<any> {
    if (!value) {
      throw new Error('The value must not be null');
    }

    return value as FormGroup<(typeof value)['value']>;
  }
}
