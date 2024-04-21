import { Component } from '@angular/core';
import { DatabaseService } from '../../services/database.service';
import {
  HistoryEssay,
  HistoryEssayDbTableContext,
} from '../../models/business/database/history_essay.model';
import { AbmPage } from '../../models/core/abm-page.model';
import { Observable, first, filter, tap } from 'rxjs';
import { GlobalFilterManager } from '../../models/core/global-filter-manager.model';
import {
  TC_AlignHorizontal,
  TC_FilterType,
  TC_MatchMode,
  TableColumn,
} from '../../models/core/table-column.model';
import { MessagesService } from '../../services/messages.service';
import { BrandDbTableContext } from '../../models/business/database/brand.model';
import { MeterDbTableContext } from '../../models/business/database/meter.model';

@Component({
  templateUrl: './history-essay.component.html',
  styleUrls: ['./history-essay.component.scss'],
})
export class HistoryEssayComponent extends AbmPage<HistoryEssay> {
  readonly title: string = 'Historial de ejecución';
  readonly cols: TableColumn<HistoryEssay>[] = [
    {
      templateName: 'saved_time',
      template: undefined, // se inicializa en abm.component.ts
      header: 'Realizado',
      sortable: `${HistoryEssayDbTableContext.tableName}.saved_time`,
      filter: {
        field: `${HistoryEssayDbTableContext.tableName}.saved_time`,
        type: TC_FilterType.date,
        showMatchModes: false,
        matchMode: TC_MatchMode.dateIs,
        showAddButton: false,
        showOperator: false,
        hideOnClear: true,
      },
    },
    {
      field: 'essay_name',
      header: 'Ensayo',
      sortable: `${HistoryEssayDbTableContext.tableName}.essay_name`,
      globalFilter: `${HistoryEssayDbTableContext.tableName}.essay_name`,
      alignHorizontal: TC_AlignHorizontal.Text,
    },
    {
      field: 'step_name',
      header: 'Paso',
      sortable: `${HistoryEssayDbTableContext.tableName}.step_name`,
      globalFilter: `${HistoryEssayDbTableContext.tableName}.step_name`,
      alignHorizontal: TC_AlignHorizontal.Text,
    },
    {
      field: 'foreign.meter.foreign.brand.name',
      header: 'Marca',
      sortable: `${BrandDbTableContext.tableName}.name`,
      globalFilter: `${BrandDbTableContext.tableName}.name`,
      alignHorizontal: TC_AlignHorizontal.Text,
    },
    {
      field: 'foreign.meter.model',
      header: 'Modelo',
      sortable: `${MeterDbTableContext.tableName}.model`,
      globalFilter: `${MeterDbTableContext.tableName}.model`,
      alignHorizontal: TC_AlignHorizontal.Text,
    },
    {
      field: 'serial_number',
      header: 'Número de serie',
      sortable: `${HistoryEssayDbTableContext.tableName}.serial_number`,
      globalFilter: `${HistoryEssayDbTableContext.tableName}.serial_number`,
      alignHorizontal: TC_AlignHorizontal.Text,
    },
    {
      field: 'year_of_production',
      header: 'Año de fabricación',
      sortable: `${HistoryEssayDbTableContext.tableName}.year_of_production`,
      globalFilter: `${HistoryEssayDbTableContext.tableName}.year_of_production`,
      alignHorizontal: TC_AlignHorizontal.Number,
    },
    {
      templateName: 'result_status_enum',
      template: undefined, // se inicializa en abm.component.ts
      header: 'Resultado',
      sortable: `${HistoryEssayDbTableContext.tableName}.result_status_enum`,
      // filter: TODO filtro por opciones
    },
  ];
  readonly historyEssayRows$: Observable<HistoryEssay[]>;

  constructor(
    private readonly dbService: DatabaseService<HistoryEssay>,
    private readonly messagesService: MessagesService
  ) {
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

  deleteHistoryEssay(ids: string[] = []) {
    this.dbService
      .deleteTableElements$(HistoryEssayDbTableContext.tableName, ids)
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

  // TODO detalle del medidor
}
