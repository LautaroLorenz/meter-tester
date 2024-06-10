import { AfterViewInit, ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormArray, FormBuilder } from '@angular/forms';
import { Observable, map, takeUntil, tap } from 'rxjs';
import { StepBuildFormComponent } from '../../../../models/business/class/step-build-form-component.model';
import {
    PreparationFormBuilder,
    PreparationStep
} from '../../../../models/business/interafces/steps/preparation-step.model';
import { Stand, StandMeter } from '../../../../models/business/interafces/stand.model';
import { AbstractFormGroup } from '../../../../models/core/abstract-form-group.model';
import { DatabaseService } from '../../../../services/database.service';
import { Meter, MeterDbTableContext } from '../../../../models/business/database/meter.model';
import { YearOfProductionConstants } from '../../../../models/business/constants/year-of-production-constant.model';
import { RelationsManager } from '../../../../models/core/relations-manager.model';

@Component({
    selector: 'app-preparation-build-form',
    templateUrl: './preparation-build-form.component.html',
    styleUrls: ['./preparation-build-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PreparationBuildFormComponent extends StepBuildFormComponent<PreparationStep> implements AfterViewInit {
    meters$!: Observable<StandMeter[]>;

    readonly YearOfProductionConstants = YearOfProductionConstants;

    private readonly dbServiceMeters = inject(DatabaseService<Meter>);

    get standsFormArray(): FormArray<AbstractFormGroup<Stand>> {
        return this.form.get('form_control_raw') as FormArray<AbstractFormGroup<Stand>>;
    }

    ngAfterViewInit(): void {
        if (this.isVerification) {
            this.formValidChange.emit(this.form.valid);
        }
    }

    copyStandToAll(strandFormGroup: AbstractFormGroup<Stand>): void {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { name, ...propsToCopy } = strandFormGroup.getRawValue();
        this.standsFormArray.controls.forEach((group) => {
            group.patchValue({ ...propsToCopy });
        });
    }

    override buildForm(fb: FormBuilder): AbstractFormGroup<PreparationStep> {
        return new PreparationFormBuilder().build(fb).form as AbstractFormGroup<PreparationStep>;
    }

    override buildVerificationForm(fb: FormBuilder): AbstractFormGroup<PreparationStep> {
        return new PreparationFormBuilder().build(fb).withVerificationProps()
            .form as AbstractFormGroup<PreparationStep>;
    }

    override observeTables(): void {
        this.meters$ = this.dbServiceMeters.getTableReply$(MeterDbTableContext.tableName).pipe(
            takeUntil(this.onDestroy),
            map((response) => {
                const { foreignTables } = MeterDbTableContext;
                return RelationsManager.mergeRelationsIntoRows<Meter>(response.rows, response.relations, foreignTables);
            }),
            map((rows) =>
                rows.map((x) => ({
                    ...x,
                    label: `${x.foreign.brand.name} - ${x.model}`
                }))
            ),
            map((rows) => rows.sort((a, b) => a.label.localeCompare(b.label)))
        );
    }

    override requestToolsTables(): void {
        this.dbServiceMeters.getTable(MeterDbTableContext.tableName, {
            relations: MeterDbTableContext.foreignTables
        });
    }

    override afterSuperObserveForm(): void {
        this.standsFormArray.controls.forEach((standFormGroup) => {
            standFormGroup
                .get('isActive')
                ?.valueChanges.pipe(
                    takeUntil(this.onDestroy),
                    tap((isActive) => {
                        if (isActive) {
                            standFormGroup.get('meter_id')?.enable();
                            standFormGroup.get('serialNumber')?.enable();
                            standFormGroup.get('yearOfProduction')?.enable();
                        } else {
                            standFormGroup.get('meter_id')?.disable();
                            standFormGroup.get('meter_id')?.reset();
                            standFormGroup.get('serialNumber')?.disable();
                            standFormGroup.get('serialNumber')?.reset();
                            standFormGroup.get('yearOfProduction')?.disable();
                            standFormGroup.get('yearOfProduction')?.reset();
                        }
                        standFormGroup.get('meter_id')?.updateValueAndValidity();
                        standFormGroup.get('serialNumber')?.updateValueAndValidity();
                        standFormGroup.get('yearOfProduction')?.updateValueAndValidity();
                    })
                )
                .subscribe();

            standFormGroup.get('isActive')?.updateValueAndValidity();
        });
    }

    override afterSuperPatchInitValue(): void {
        this.setStandsName();
    }

    private setStandsName(): void {
        this.standsFormArray.controls.forEach((group, index) => {
            const name = `Puesto ${(index + 1).toString().padStart(2, '0')}`;
            group.get('name')?.setValue(name);
        });
    }
}
