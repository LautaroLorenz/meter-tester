import { FormControl, FormGroup } from '@angular/forms';

export type AbstractFormGroup<T extends Record<string, any>> = FormGroup<{
  [Property in keyof T]:
    | FormControl<T[Property] | undefined>
    | AbstractFormGroup<T[Property]>;
}>;
