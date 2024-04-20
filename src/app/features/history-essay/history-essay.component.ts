import { Component } from '@angular/core';
import { DatabaseService } from '../../services/database.service';
import {
  HistoryEssay,
  HistoryEssayDbTableContext,
} from '../../models/business/database/history_essay.model';
import { AbmPage } from '../../models/core/abm-page.model';
import { Observable } from 'rxjs';
import { GlobalFilterManager } from '../../models/core/global-filter-manager.model';
import {
  TC_AlignHorizontal,
  TableColumn,
} from '../../models/core/table-column.model';

@Component({
  templateUrl: './history-essay.component.html',
  styleUrls: ['./history-essay.component.scss'],
})
export class HistoryEssayComponent extends AbmPage<HistoryEssay> {
  readonly title: string = 'Historial de ejecución';
  readonly cols: TableColumn<HistoryEssay>[] = [
    {
      field: 'essay_name',
      header: 'Ensayo',
      sortable: 'essay_name',
      globalFilter: 'essay_name',
      alignHorizontal: TC_AlignHorizontal.Text,
    },
    {
      field: 'step_name',
      header: 'Paso',
      sortable: 'step_name',
      globalFilter: 'step_name',
      alignHorizontal: TC_AlignHorizontal.Text,
    },
    {
      field: 'foreign.meter.foreign.brand.name',
      header: 'Marca',
      sortable: 'foreign.meter.foreign.brand.name',
      globalFilter: 'foreign.meter.foreign.brand.name',
      alignHorizontal: TC_AlignHorizontal.Text,
    },
    {
      field: 'foreign.meter.model',
      header: 'Modelo',
      sortable: 'foreign.meter.model',
      globalFilter: 'foreign.meter.model',
      alignHorizontal: TC_AlignHorizontal.Text,
    },
    {
      field: 'serial_number',
      header: 'Número de serie',
      sortable: 'serial_number',
      globalFilter: 'serial_number',
      alignHorizontal: TC_AlignHorizontal.Text,
    },
    {
      field: 'year_of_production',
      header: 'Año de fabricación',
      sortable: 'year_of_production',
      globalFilter: 'year_of_production',
      alignHorizontal: TC_AlignHorizontal.Number,
    },
    {
      field: 'result_status_enum',
      header: 'Resultado',
      sortable: 'result_status_enum',
      globalFilter: 'result_status_enum',
      alignHorizontal: TC_AlignHorizontal.Text,
    },
  ];
  readonly historyEssayRows$: Observable<HistoryEssay[]>;

  constructor(private readonly dbService: DatabaseService<HistoryEssay>) {
    super(dbService, HistoryEssayDbTableContext);
    this.historyEssayRows$ = this.refreshDataWhenDatabaseReply$(
      HistoryEssayDbTableContext.tableName
    );
  }

  override refreshTable(): void {
    this.dbService.getTable(HistoryEssayDbTableContext.tableName, {
      relations: HistoryEssayDbTableContext.foreignTables,
      lazyLoadEvent: this.lazyLoadEvent,
      globalFilterColumns: GlobalFilterManager.transform(this.cols),
    });
  }

  // TODO sumar la fecha, y poder ordenar por la fecha
  // TODO eliminación de filas
  // TODO columna resultado
  // TODO detalle del medidor
}
