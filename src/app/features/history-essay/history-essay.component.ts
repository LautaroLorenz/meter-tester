import { Component } from '@angular/core';
import { DatabaseService } from '../../services/database.service';
import {
  HistoryEssay,
  HistoryEssayDbTableContext,
  HistoryEssayTableColumns,
} from '../../models/business/database/history_essay.model';
import { AbmPage } from '../../models/core/abm-page.model';
import { Observable } from 'rxjs';
import { GlobalFilterManager } from '../../models/core/global-filter-manager.model';

@Component({
  templateUrl: './history-essay.component.html',
  styleUrls: ['./history-essay.component.scss'],
})
export class HistoryEssayComponent extends AbmPage<HistoryEssay> {
  readonly title: string = 'Historial de ejecución';
  readonly cols = HistoryEssayTableColumns;
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
      globalFilterColumns: GlobalFilterManager.transform(
        HistoryEssayTableColumns
      ),
    });
  }

  // TODO sumar la fecha, y poder ordenar por la fecha
  // TODO eliminación de filas
  // TODO columna resultado
  // TODO detalle del medidor
}
