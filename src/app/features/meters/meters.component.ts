/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { filter, first, Observable, ReplaySubject, takeUntil, tap } from 'rxjs';
import { AbmPage } from '../../models/core/abm-page.model';
import {
  Meter,
  MeterDbTableContext,
  MeterTableColumns,
} from '../../models/business/database/meter.model';
import { DatabaseService } from '../../services/database.service';
import { MessagesService } from '../../services/messages.service';
import {
  Brand,
  BrandDbTableContext,
} from '../../models/business/database/brand.model';
import {
  ActiveConstantUnit,
  ActiveConstantUnitDbTableContext,
} from '../../models/business/database/active-constant-unit.model';
import {
  ReactiveConstantUnit,
  ReactiveConstantUnitDbTableContext,
} from '../../models/business/database/reactive-constant-unit.model';
import {
  Connection,
  ConnectionDbTableContext,
} from '../../models/business/database/connection.model';

@Component({
  templateUrl: './meters.component.html',
  styleUrls: ['./meters.component.scss'],
})
export class MetersComponent
  extends AbmPage<Meter>
  implements OnInit, OnDestroy
{
  readonly title: string = 'Administración de medidores';
  readonly cols = MeterTableColumns;
  readonly form: FormGroup;
  readonly meters$: Observable<Meter[]>;

  dropdownActiveConstantUnitOptions: ActiveConstantUnit[] = [];
  dropdownReactiveConstantUnitOptions: ReactiveConstantUnit[] = [];
  dropdownBrandOptions: Brand[] = [];
  dropdownConnectionOptions: Connection[] = [];

  private readonly destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(
    private readonly dbService: DatabaseService<Meter>,
    private readonly messagesService: MessagesService,
    private readonly fb: FormBuilder
  ) {
    super(dbService, MeterDbTableContext);
    this.meters$ = this.refreshDataWhenDatabaseReply$(
      MeterDbTableContext.tableName
    ).pipe(tap(() => this.updateDropdownOptions()));
    this.form = this.fb.group({
      id: this.fb.control(undefined),
      model: this.fb.control(undefined, Validators.required.bind(this)),
      maximumCurrent: this.fb.control(undefined, [
        Validators.required.bind(this),
        Validators.min(0),
        Validators.max(999),
      ]),
      ratedCurrent: this.fb.control(undefined, [
        Validators.required.bind(this),
        Validators.min(0),
        Validators.max(999),
      ]),
      ratedVoltage: this.fb.control(undefined, [
        Validators.required.bind(this),
        Validators.min(0),
        Validators.max(999),
      ]),
      activeConstantValue: this.fb.control(undefined, [
        Validators.required.bind(this),
        Validators.min(0),
        Validators.max(99999),
      ]),
      activeConstantUnit_id: this.fb.control(
        undefined,
        Validators.required.bind(this)
      ),
      reactiveConstantValue: this.fb.control(undefined, [
        Validators.required.bind(this),
        Validators.min(0),
        Validators.max(99999),
      ]),
      reactiveConstantUnit_id: this.fb.control(
        undefined,
        Validators.required.bind(this)
      ),
      brand_id: this.fb.control(undefined, Validators.required.bind(this)),
      connection_id: this.fb.control(undefined, Validators.required.bind(this)),
    });
    this.initFormValueChangeListeners();
  }

  ngOnInit(): void {
    this.dbService.getTable(MeterDbTableContext.tableName, {
      relations: MeterDbTableContext.foreignTables.map((ft) => ft.tableName),
    });
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  deleteMeters(ids: string[] = []) {
    this.dbService
      .deleteTableElements$(MeterDbTableContext.tableName, ids)
      .pipe(
        first(),
        filter(
          (numberOfElementsDeleted) => numberOfElementsDeleted === ids.length
        ),
        tap(() => {
          this.dbService.getTable(MeterDbTableContext.tableName);
          this.messagesService.success('Eliminado correctamente');
        })
      )
      .subscribe({
        error: () =>
          this.messagesService.error(
            'Verifique que ningun elemento este en uso antes de eliminar'
          ),
      });
  }

  setFormValues(meter: Meter) {
    this.form.reset();
    this.form.patchValue(meter);
  }

  saveMeter() {
    if (!this.form.valid) {
      return;
    }

    const meter: Meter = this.form.getRawValue();
    if (this.form.get('id')?.value) {
      this.editMeter(meter);
    } else {
      this.createMeter(meter);
    }
  }

  private readonly updateDropdownOptions = (): void => {
    this.dropdownActiveConstantUnitOptions = this._relations[
      ActiveConstantUnitDbTableContext.tableName
    ].sort((a, b) => a.name.localeCompare(b.name));
    this.dropdownReactiveConstantUnitOptions = this._relations[
      ReactiveConstantUnitDbTableContext.tableName
    ].sort((a, b) => a.name.localeCompare(b.name));
    this.dropdownBrandOptions = this._relations[
      BrandDbTableContext.tableName
    ].sort((a, b) => a.name.localeCompare(b.name));
    this.dropdownConnectionOptions = this._relations[
      ConnectionDbTableContext.tableName
    ].sort((a, b) => a.name.localeCompare(b.name));
  };

  private initFormValueChangeListeners(): void {
    this.form
      .get('activeConstantUnit_id')
      ?.valueChanges.pipe(
        takeUntil(this.destroyed$),
        filter((id) => id !== null),
        filter((id) => id !== undefined),
        filter(() => !this.form.get('reactiveConstantUnit_id')?.value),
        tap((id) => this.form.get('reactiveConstantUnit_id')?.setValue(id))
      )
      .subscribe();
    this.form
      .get('reactiveConstantUnit_id')
      ?.valueChanges.pipe(
        takeUntil(this.destroyed$),
        filter((id) => id !== null),
        filter((id) => id !== undefined),
        filter(() => !this.form.get('activeConstantUnit_id')?.value),
        tap((id) => this.form.get('activeConstantUnit_id')?.setValue(id))
      )
      .subscribe();
  }

  private createMeter(meter: Meter) {
    this.dbService
      .addElementToTable$(MeterDbTableContext.tableName, meter)
      .pipe(
        first(),
        tap(() => {
          this.dbService.getTable(MeterDbTableContext.tableName);
          this.messagesService.success('Agregado correctamente');
        })
      )
      .subscribe({
        error: () => this.messagesService.error('No se pudo crear el elemento'),
      });
  }

  private editMeter(meter: Meter) {
    this.dbService
      .editElementFromTable$(MeterDbTableContext.tableName, meter)
      .pipe(
        first(),
        tap(() => {
          this.dbService.getTable(MeterDbTableContext.tableName);
          this.messagesService.success('Editado correctamente');
        })
      )
      .subscribe({
        error: () =>
          this.messagesService.error('No se pudo editar el elemento'),
      });
  }
}
