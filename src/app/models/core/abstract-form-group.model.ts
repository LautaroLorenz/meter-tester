import { FormArray, FormControl, FormGroup, FormRecord } from '@angular/forms';

export type AbstractFormGroup<T extends Record<string, any>> = FormGroup<{
  [Property in keyof T]:
    | FormControl<T[Property] | undefined>
    | FormRecord<T[Property]>
    | FormArray<FormControl<T[Property][0]> | AbstractFormGroup<T[Property][0]>>
    | AbstractFormGroup<T[Property]>;
}>;
