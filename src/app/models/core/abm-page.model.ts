import { map, Observable, tap } from 'rxjs';
import { DatabaseService } from '../../services/database.service';
import { DbTableContext, TableRelationsMap } from './database.model';
import { RelationsManager } from './relations-manager.model';

export class AbmPage<T> {
  protected _relations: TableRelationsMap = {};
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

  private _setRelations(relations: TableRelationsMap): void {
    this._relations = { ...this._relations, ...relations };
  }
}
