/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { filter, first, Observable, ReplaySubject, takeUntil, tap } from 'rxjs';
import { AbmPage } from '../../models/core/abm-page.model';
import {
  Meter,
  MeterDbTableContext,
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
import { GlobalFilterManager } from '../../models/core/global-filter-manager.model';
import {
  TC_AlignHorizontal,
  TableColumn,
} from '../../models/core/table-column.model';

@Component({
  templateUrl: './meters.component.html',
  styleUrls: ['./meters.component.scss'],
})
export class MetersComponent extends AbmPage<Meter> implements OnDestroy {
  readonly title: string = 'Administración de medidores';
  readonly cols: TableColumn<Meter>[] = [
    {
      field: 'foreign.brand.name',
      header: 'Marca',
      sortable: 'foreign.brand.name',
      globalFilter: 'foreign.brand.name',
      alignHorizontal: TC_AlignHorizontal.Text,
    },
    {
      field: 'model',
      header: 'Modelo',
      sortable: 'model',
      globalFilter: 'model',
      alignHorizontal: TC_AlignHorizontal.Text,
    },
    {
      field: 'foreign.connection.name',
      header: 'Conexión',
      sortable: 'foreign.connection.name',
      globalFilter: 'foreign.connection.name',
      alignHorizontal: TC_AlignHorizontal.Text,
    },
    {
      field: 'maximumCurrent',
      header: 'Imax [A]',
      sortable: 'maximumCurrent',
      globalFilter: 'maximumCurrent',
      alignHorizontal: TC_AlignHorizontal.Number,
      headerTooltip: 'Corriente máxima',
    },
    {
      field: 'ratedCurrent',
      header: 'In [A]',
      sortable: 'ratedCurrent',
      globalFilter: 'ratedCurrent',
      alignHorizontal: TC_AlignHorizontal.Number,
      headerTooltip: 'Corriente nominal',
    },
    {
      field: 'ratedVoltage',
      header: 'Un [V]',
      sortable: 'ratedVoltage',
      globalFilter: 'ratedVoltage',
      alignHorizontal: TC_AlignHorizontal.Number,
      headerTooltip: 'Tensión nominal',
    },
    {
      field: (meter) =>
        `${meter.activeConstantValue} [${meter.foreign.activeConstantUnit.name}]`,
      header: 'Cte. energía activa',
      headerTooltip: 'Constante de energía activa',
      sortable: ['activeConstantValue', 'foreign.activeConstantUnit.name'],
      globalFilter: ['activeConstantValue', 'foreign.activeConstantUnit.name'],
      alignHorizontal: TC_AlignHorizontal.Alphanumeric,
    },
    {
      field: (meter) =>
        `${meter.reactiveConstantValue} [${meter.foreign.reactiveConstantUnit.name}]`,
      header: 'Cte. energía reactiva',
      headerTooltip: 'Constante de energía reactiva',
      sortable: ['reactiveConstantValue', 'foreign.reactiveConstantUnit.name'],
      globalFilter: [
        'reactiveConstantValue',
        'foreign.reactiveConstantUnit.name',
      ],
      alignHorizontal: TC_AlignHorizontal.Alphanumeric,
    },
  ];
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
          this.refreshTable();
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

  override refreshTable(): void {
    this.dbService.getTable(MeterDbTableContext.tableName, {
      relations: MeterDbTableContext.foreignTables,
      lazyLoadEvent: this.lazyLoadEvent,
      globalFilterColumns: GlobalFilterManager.transform(this.cols),
    });
  }

  private readonly updateDropdownOptions = (): void => {
    if (this._relations[ActiveConstantUnitDbTableContext.tableName]) {
      this.dropdownActiveConstantUnitOptions = this._relations[
        ActiveConstantUnitDbTableContext.tableName
      ].sort((a, b) => a.name.localeCompare(b.name));
    }
    if (this._relations[ReactiveConstantUnitDbTableContext.tableName]) {
      this.dropdownReactiveConstantUnitOptions = this._relations[
        ReactiveConstantUnitDbTableContext.tableName
      ].sort((a, b) => a.name.localeCompare(b.name));
    }
    if (this._relations[BrandDbTableContext.tableName]) {
      this.dropdownBrandOptions = this._relations[
        BrandDbTableContext.tableName
      ].sort((a, b) => a.name.localeCompare(b.name));
    }
    if (this._relations[ConnectionDbTableContext.tableName]) {
      this.dropdownConnectionOptions = this._relations[
        ConnectionDbTableContext.tableName
      ].sort((a, b) => a.name.localeCompare(b.name));
    }
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
          this.refreshTable();
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
          this.refreshTable();
          this.messagesService.success('Editado correctamente');
        })
      )
      .subscribe({
        error: () =>
          this.messagesService.error('No se pudo editar el elemento'),
      });
  }
}
