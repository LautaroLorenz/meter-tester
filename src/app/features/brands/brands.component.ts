import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { filter, first, Observable, tap } from 'rxjs';
import {
  Brand,
  BrandDbTableContext,
} from '../../models/business/database/brand.model';
import { DatabaseService } from '../../services/database.service';
import { MessagesService } from '../../services/messages.service';
import { AbmPage } from '../../models/core/abm-page.model';
import { GlobalFilterManager } from '../../models/core/global-filter-manager.model';
import {
  TC_AlignHorizontal,
  TableColumn,
} from '../../models/core/table-column.model';

@Component({
  templateUrl: './brands.component.html',
  styleUrls: ['./brands.component.scss'],
})
export class BrandsComponent extends AbmPage<Brand> {
  readonly title: string = 'Administración de marcas';
  readonly cols: TableColumn<Brand>[] = [
    {
      field: 'name',
      header: 'Marca',
      sortable: `${BrandDbTableContext.tableName}.name`,
      globalFilter: 'name',
      alignHorizontal: TC_AlignHorizontal.Text,
    },
  ];
  readonly form: FormGroup;
  readonly brands$: Observable<Brand[]>;

  constructor(
    private readonly dbService: DatabaseService<Brand>,
    private readonly messagesService: MessagesService
  ) {
    super(dbService, BrandDbTableContext);
    this.brands$ = this.refreshDataWhenDatabaseReply$(
      BrandDbTableContext.tableName
    ).pipe(tap(() => this.updateDropdownOptions()));
    this.form = new FormGroup({
      id: new FormControl(),
      name: new FormControl(undefined, Validators.required.bind(this)),
    });
  }

  deleteBrands(ids: string[] = []) {
    this.dbService
      .deleteTableElements$(BrandDbTableContext.tableName, ids)
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

  setFormValues(brand: Brand) {
    this.form.reset();
    this.form.patchValue(brand);
  }

  saveBrand() {
    if (!this.form.valid) {
      return;
    }

    const brand: Brand = this.form.getRawValue();
    if (this.form.get('id')?.value) {
      this.editBrand(brand);
    } else {
      this.createBrand(brand);
    }
  }

  override refreshTable(): void {
    this.dbService.getTable(BrandDbTableContext.tableName, {
      relations: BrandDbTableContext.foreignTables,
      lazyLoadEvent: this.lazyLoadEvent,
      globalFilterColumns: GlobalFilterManager.transform(this.cols),
    });
  }

  private readonly updateDropdownOptions = (): void => {};

  private createBrand(brand: Brand) {
    this.dbService
      .addElementToTable$(BrandDbTableContext.tableName, brand)
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

  private editBrand(brand: Brand) {
    this.dbService
      .editElementFromTable$(BrandDbTableContext.tableName, brand)
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
