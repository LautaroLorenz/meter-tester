/* eslint-disable @typescript-eslint/no-unsafe-return */ // FIXME
import { Injectable, NgZone } from '@angular/core';
import { catchError, filter, from, map, Observable, Subject, tap, throwError } from 'rxjs';
import { IpcService } from './ipc.service';
import { ForeignTable, RequestTableResponse, TableName, Where } from '../models/core/database.model';
import { FilterMetadata, LazyLoadEvent } from 'primeng/api';

@Injectable({
    providedIn: 'root'
})
export class DatabaseService<T> {
    private readonly _getTableReply$ = new Subject<RequestTableResponse<T>>();

    constructor(
        private readonly ipcService: IpcService,
        private readonly ngZone: NgZone
    ) {
        this._listenGetDatabaseTableReply(ipcService);
    }

    getTable$(
        tableName: TableName,
        options: {
            relations?: ForeignTable[];
            conditions?: Where[];
            lazyLoadEvent?: Omit<LazyLoadEvent, 'filters'> & {
                // arreglar un error e primeng donde devuelve filters como FilterMetadata | FilterMetadata[], pero lo declara como únicamente FilterMetadata
                filters?: { [s: string]: FilterMetadata | FilterMetadata[] };
            };
            globalFilterColumns?: string[];
        } = {
                relations: [],
                conditions: [],
                lazyLoadEvent: {},
                globalFilterColumns: []
            },
        rawProperties: string[] = []
    ): Observable<RequestTableResponse<T>> {
        this.getTable(tableName, options, rawProperties);
        return this.getTableReply$(tableName);
    }

    getTable(
        tableName: TableName,
        options: {
            relations?: ForeignTable[];
            conditions?: Where[];
            lazyLoadEvent?: Omit<LazyLoadEvent, 'filters'> & {
                // arreglar un error e primeng donde devuelve filters como FilterMetadata | FilterMetadata[], pero lo declara como únicamente FilterMetadata
                filters?: { [s: string]: FilterMetadata | FilterMetadata[] };
            };
            globalFilterColumns?: string[];
        } = {
                relations: [],
                conditions: [],
                lazyLoadEvent: {},
                globalFilterColumns: []
            },
        rawProperties: string[] = []
    ): void {
        const { first, rows, sortField, sortOrder, globalFilter, filters } = options.lazyLoadEvent ?? {};
        const lazyLoadEvent = {
            first,
            rows,
            sortField,
            sortOrder,
            globalFilter,
            filters
        };
        this.ipcService.send('get-table', {
            tableName,
            relations: options.relations ?? [],
            conditions: options.conditions ?? [],
            globalFilterColumns: options.globalFilterColumns ?? [],
            lazyLoadEvent,
            rawProperties
        });
    }

    getTableReply$(tableName: string): Observable<RequestTableResponse<T>> {
        return this._getTableDataAsObservable(tableName);
    }

    getTableElement$(tableName: string, id: number): Observable<T> {
        return from(this._getTableRow(tableName, id));
    }

    deleteTableElements$(tableName: string, ids: any[]): Observable<number> {
        return from(this._deleteRowFromDatabaseTable(tableName, ids)).pipe(
            catchError((e) => {
                console.error(e.message); // TODO: almacenar en un log
                // FIXME
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                return throwError(() => new Error(e));
            })
        );
    }

    addElementToTable$(
        tableName: string,
        element: T | Omit<T, 'id' | 'foreign'>,
        rawProperties: string[]
    ): Observable<number> {
        return from(this._addRowToTable(tableName, element, rawProperties)).pipe(
            tap((result) => {
                if (result === null) {
                    throw new Error('Error al agregar el elemento a la tabla');
                }
            }),
            map((result) => result as number[]),
            map(([newElementId]) => newElementId)
        );
    }

    editElementFromTable$(tableName: string, element: T, rawProperties: string[]): Observable<number> {
        return from(this._editTableRow(tableName, element, rawProperties));
    }

    changeConnectionPath(): Observable<{ success: boolean; message: string }> {
        return this.ipcService.invoke$('change-connection-path');
    }

    private readonly _listenGetDatabaseTableReply = (ipcService: IpcService): void => {
        ipcService.on('get-table-reply', (_: any, args: any) => {
            // FIXME
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            this.ngZone.run(() => this._updateLocalTableData(args));
        });
    };

    private readonly _updateLocalTableData = (response: RequestTableResponse<T>) => {
        this._getTableReply$.next(response);
    };

    private readonly _getTableDataAsObservable = (tableName: string): Observable<RequestTableResponse<T>> =>
        this._getTableReply$.pipe(filter(({ tableNameReply }) => tableNameReply === tableName));

    private _deleteRowFromDatabaseTable = (tableName: string, ids: any[]): Promise<number> => {
        return this.ipcService.invoke('delete-from-table', { tableName, ids });
    };

    private _addRowToTable = (
        tableName: string,
        element: T | Omit<T, 'id' | 'foreign'>,
        rawProperties: string[]
    ): Observable<number[] | null> => {
        return this.ipcService.invoke$('add-to-table', {
            tableName,
            element,
            rawProperties
        });
    };

    private _editTableRow = (tableName: string, element: T, rawProperties: string[]): Observable<number> => {
        return this.ipcService.invoke$('edit-from-table', {
            tableName,
            element,
            rawProperties
        });
    };

    private _getTableRow = (tableName: string, id: number): Promise<T> => {
        return this.ipcService.invoke('get-table-row', { tableName, id });
    };
}
