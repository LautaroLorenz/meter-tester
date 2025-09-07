import { AbstractControl, FormGroup } from '@angular/forms';

export const copyPhase = (
    fromFormGroup: AbstractControl<FormGroup> | null,
    targetFormGroups: (AbstractControl<FormGroup> | null) | (AbstractControl<FormGroup> | null)[]
): void => {
    if (!fromFormGroup || !targetFormGroups) {
        return;
    }

    const sourceValue = fromFormGroup.getRawValue();
    if (Array.isArray(targetFormGroups)) {
        targetFormGroups.forEach((targetFormGroup) => {
            if (!targetFormGroup) {
                return;
            }
            targetFormGroup.setValue(sourceValue as FormGroup<any>);
        });
    } else {
        targetFormGroups.setValue(sourceValue as FormGroup<any>);
    }
};
