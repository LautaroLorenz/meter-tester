import { map, Observable, tap, startWith, take } from 'rxjs';
import { DatabaseService } from '../../services/database.service';
import { DbTableContext, RequestTableResponse, TableRelationsMap } from './database.model';
import { RelationsManager } from './relations-manager.model';
import { LazyLoadEvent } from 'primeng/api';
import { inject } from '@angular/core';
import { BlockUIService } from '../../services/block-ui.service';
import { ExcelExportService } from '../../services/excel-export.service';

export abstract class AbmPage<T> {
    protected totalRecords = 0;
    protected _relations: TableRelationsMap = {};
    protected lazyLoadEvent: LazyLoadEvent = {};
    private readonly _dbService: DatabaseService<T>;
    private readonly _dbTableConnection: DbTableContext;
    private readonly excelExportService = inject(ExcelExportService);
    private readonly blockUIService = inject(BlockUIService);

    abstract readonly excelExportFileName: string;

    constructor(dbService: DatabaseService<T>, dbTableConnection: DbTableContext) {
        this._dbService = dbService;
        this._dbTableConnection = dbTableConnection;
    }

    protected refreshDataWhenDatabaseReply$(tableName: string): Observable<T[]> {
        // FIXME
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this._dbService.getTableReply$(tableName).pipe(
            startWith({
                totalRecords: 0,
                relations: {},
                rows: []
            }),
            tap(({ totalRecords }) => (this.totalRecords = totalRecords)),
            tap(({ relations }) => this._setRelations(relations)),
            map(({ rows }) =>
                // FIXME
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                RelationsManager.mergeRelationsIntoRows<T>(rows, this._relations, this._dbTableConnection.foreignTables)
            )
        );
    }

    protected lazyLoad(lazyLoadEvent: LazyLoadEvent): void {
        this.lazyLoadEvent = lazyLoadEvent;
        this.refreshTable();
    }

    protected export(): void {
        this.blockUIService.setBlocked(true);
        this.exportQuery$().pipe(take(1)).subscribe((result) => {
            const excelData = this.exportDataTransform(result);
            this.excelExportService.exportAsExcelFile(excelData, this.excelExportFileName);
            this.blockUIService.setBlocked(false);
        });
    }

    private _setRelations(relations: TableRelationsMap): void {
        this._relations = { ...this._relations, ...relations };
    }

    abstract refreshTable(): void;

    abstract exportQuery$(): Observable<RequestTableResponse<T>>;

    abstract exportDataTransform(data: RequestTableResponse<T>): any[];
}
