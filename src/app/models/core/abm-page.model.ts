import { map, Observable, tap } from 'rxjs';
import { DatabaseService } from '../../services/database.service';
import { DbTableContext, TableRelationsMap } from './database.model';
import { RelationsManager } from './relations-manager.model';
import { LazyLoadEvent } from 'primeng/api';

export abstract class AbmPage<T> {
  protected totalRecords = 0;
  protected _relations: TableRelationsMap = {};
  protected lazyLoadEvent: LazyLoadEvent = {};
  private readonly _dbService: DatabaseService<T>;
  private readonly _dbTableConnection: DbTableContext;

  constructor(
    dbService: DatabaseService<T>,
    dbTableConnection: DbTableContext
  ) {
    this._dbService = dbService;
    this._dbTableConnection = dbTableConnection;
  }

  protected refreshDataWhenDatabaseReply$(tableName: string): Observable<T[]> {
    // FIXME
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this._dbService.getTableReply$(tableName).pipe(
      tap(({ totalRecords }) => (this.totalRecords = totalRecords)),
      tap(({ relations }) => this._setRelations(relations)),
      map(({ rows }) =>
        // FIXME
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        RelationsManager.mergeRelationsIntoRows<T>(
          rows,
          this._relations,
          this._dbTableConnection.foreignTables
        )
      )
    );
  }

  protected lazyLoad(lazyLoadEvent: LazyLoadEvent): void {
    this.lazyLoadEvent = lazyLoadEvent;
    this.refreshTable();
  }

  private _setRelations(relations: TableRelationsMap): void {
    this._relations = { ...this._relations, ...relations };
  }

  abstract refreshTable(): void;
}
