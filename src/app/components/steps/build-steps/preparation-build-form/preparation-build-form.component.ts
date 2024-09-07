import { BarcodeScannerParams } from './../../../../models/business/interafces/barcode-scanner-params.model';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, inject, QueryList, ViewChildren } from '@angular/core';
import { FormArray, FormBuilder } from '@angular/forms';
import { Observable, map, takeUntil, tap, debounceTime } from 'rxjs';
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
import { BarcodeScanner } from '../../../../models/business/class/barcode-scanner.model';

@Component({
    selector: 'app-preparation-build-form',
    templateUrl: './preparation-build-form.component.html',
    styleUrls: ['./preparation-build-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PreparationBuildFormComponent extends StepBuildFormComponent<PreparationStep> implements AfterViewInit {
    @ViewChildren('serialNumber') serialNumbers!: QueryList<ElementRef>;

    barcodeScannerParamsMap: Record<string, BarcodeScannerParams | undefined> = {};
    meters$!: Observable<StandMeter[]>;

    readonly YearOfProductionConstants = YearOfProductionConstants;

    private readonly dbServiceMeters = inject(DatabaseService<Meter>);
    private meters: StandMeter[] = [];

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
            map((rows) => rows.sort((a, b) => a.label.localeCompare(b.label))),
            tap((meters) => this.meters = meters),
            tap(() => this.standsFormArray.controls.forEach((standFormGroup) => standFormGroup.get('meter_id')?.updateValueAndValidity()))
        );
    }

    override requestToolsTables(): void {
        this.dbServiceMeters.getTable(MeterDbTableContext.tableName, {
            relations: MeterDbTableContext.foreignTables
        }, MeterDbTableContext.rawProperties);
    }

    override afterSuperObserveForm(): void {
        this.standsFormArray.controls.forEach((standFormGroup, index) => {
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

            // si el modelo tiene habilitado el barcode scanner, aplicamos el algoritmo
            standFormGroup.get('serialNumber')?.valueChanges.pipe(
                takeUntil(this.onDestroy),
                debounceTime(350),
                tap((serialNumber) => {
                    const barcodeScannerParams = this.barcodeScannerParamsMap[index.toString()];
                    if (barcodeScannerParams && serialNumber) {
                        const scanner = BarcodeScanner.getSerialNumber(barcodeScannerParams, serialNumber as string);
                        if (scanner.match) {
                            // aplicar algoritmo de barcode scanner
                            standFormGroup.get('serialNumber')?.setValue(scanner.result, { emitEvent: false });
                            this.focusOnNextEmptySerialNumberInput(index);
                        }
                    }
                })).subscribe();

            // Verificar si el modelo seleccionado tiene el lector habilitado
            standFormGroup.get('meter_id')?.valueChanges.pipe(
                takeUntil(this.onDestroy),
                tap((meter_id) => {
                    this.barcodeScannerParamsMap[index.toString()] = this.findBarcodeScannerParams(meter_id as number, this.meters);
                })).subscribe();

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

    private findBarcodeScannerParams(meter_id: number | undefined, meters: StandMeter[]): BarcodeScannerParams | undefined {
        if (!meter_id) {
            return undefined;
        }
        if (!Array.isArray(meters) || !meters.length) {
            return undefined;
        }
        return meters.find((meter) => meter.id === meter_id && meter.isBarcodeScannerEnabled)?.barcodeScannerParams_raw;
    }

    private focusOnNextEmptySerialNumberInput(currentIndex: number): void {
        const nextSerialNumberControlIndex = this.standsFormArray.controls.findIndex((control, index) => {
            return control.get('isActive')?.value && !control.get('serialNumber')?.value && index !== currentIndex;
        });
        if (nextSerialNumberControlIndex > -1) {
            this.serialNumbers.toArray()[nextSerialNumberControlIndex].nativeElement.focus();
        }
    }
}
