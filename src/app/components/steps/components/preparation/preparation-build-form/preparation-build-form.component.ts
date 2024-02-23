import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { StepBuildFormComponent } from '../../../models/step-build-form-component.model';
import { PreparationStep } from '../models/preparation-step.model';
import { FormArray, FormBuilder } from '@angular/forms';
import { AbstractFormGroup } from '../../../../../models/core/abstract-form-group.model';
import { APP_CONFIG } from '../../../../../../environments/environment';
import { DatabaseService } from '../../../../../services/database.service';
import {
  Meter,
  MeterDbTableContext,
} from '../../../../../models/business/database/meter.model';
import { Observable, map, takeUntil } from 'rxjs';
import { RelationsManager } from '../../../../../models/core/relations-manager.model';
import { Stand } from '../../../../../models/business/interafces/stand.model';
import { YearOfProductionConstants } from '../../../../../models/business/constants/year-of-production-constant.model';

@Component({
  selector: 'app-preparation-build-form',
  templateUrl: './preparation-build-form.component.html',
  styleUrls: ['./preparation-build-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreparationBuildFormComponent extends StepBuildFormComponent<PreparationStep> {
  meters$!: Observable<Meter[]>;

  readonly YearOfProductionConstants = YearOfProductionConstants;

  private dbServiceMeters = inject(DatabaseService<Meter>);

  get standsFormArray(): FormArray<AbstractFormGroup<Stand>> {
    return this.form.get('form_control_raw') as FormArray<
      AbstractFormGroup<Stand>
    >;
  }

  override buildForm(fb: FormBuilder): AbstractFormGroup<PreparationStep> {
    // generate stand array based on APP_CONFIG variable
    const StandsGroupArray: AbstractFormGroup<Stand>[] = Array(
      APP_CONFIG.standsQuantiy
    )
      .fill(undefined)
      .map(
        (_, index) =>
          fb.nonNullable.group({
            index,
            isActive: false,
            meterId: undefined,
            serialNumber: undefined,
            yearOfProduction: undefined,
          }) as AbstractFormGroup<Stand>
      );

    return fb.nonNullable.group({
      id: undefined,
      name: undefined,
      order: undefined,
      essay_template_id: undefined,
      step_id: undefined,
      form_control_raw: fb.nonNullable.array(StandsGroupArray),
      foreign: undefined,
    }) as AbstractFormGroup<PreparationStep>;
  }

  override observeTables(): void {
    this.meters$ = this.dbServiceMeters
      .getTableReply$(MeterDbTableContext.tableName)
      .pipe(
        takeUntil(this.onDestroy),
        map((response) => {
          const { foreignTables } = MeterDbTableContext;
          return RelationsManager.mergeRelationsIntoRows<Meter>(
            response.rows,
            response.relations,
            foreignTables
          );
        }),
        map((rows) =>
          rows.map((x) => ({
            ...x,
            label: `${x.foreign.brand.name} - ${x.model}`,
          }))
        ),
        map((rows) => rows.sort((a, b) => a.label.localeCompare(b.label)))
      );
  }

  override requestToolsTables(): void {
    this.dbServiceMeters.getTable(MeterDbTableContext.tableName, {
      relations: MeterDbTableContext.foreignTables.map((ft) => ft.tableName),
    });
  }
}
