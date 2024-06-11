import { Component } from '@angular/core';
import { filter, first, Observable, tap } from 'rxjs';
import { AbmPage } from '../../models/core/abm-page.model';
import { EssayTemplate, EssayTemplateDbTableContext } from '../../models/business/database/essay-template.model';
import { MessagesService } from '../../services/messages.service';
import { DatabaseService } from '../../services/database.service';
import { GlobalFilterManager } from '../../models/core/global-filter-manager.model';
import { TableColumn, TC_AlignHorizontal } from '../../models/core/table-column.model';
import { RequestTableResponse } from '../../models/core/database.model';

@Component({
    templateUrl: './available-test.component.html',
    styleUrls: ['./available-test.component.scss']
})
export class AvailableTestComponent extends AbmPage<EssayTemplate> {
    readonly title: string = 'Administración de ensayos';
    readonly cols: TableColumn<EssayTemplate>[] = [
        {
            field: 'name',
            header: 'Ensayo',
            sortable: `${EssayTemplateDbTableContext.tableName}.name`,
            globalFilter: `${EssayTemplateDbTableContext.tableName}.name`,
            alignHorizontal: TC_AlignHorizontal.Text
        }
    ];
    readonly essayTemplates$: Observable<EssayTemplate[]>;
    readonly excelExportFileName = 'ensayos';

    constructor(
        private readonly dbService: DatabaseService<EssayTemplate>,
        private readonly messagesService: MessagesService
    ) {
        super(dbService, EssayTemplateDbTableContext);
        this.essayTemplates$ = this.refreshDataWhenDatabaseReply$(EssayTemplateDbTableContext.tableName);
    }

    deleteEssayTemplates(ids: string[] = []): void {
        this.dbService
            .deleteTableElements$(EssayTemplateDbTableContext.tableName, ids)
            .pipe(
                first(),
                filter((numberOfElementsDeleted) => numberOfElementsDeleted === ids.length),
                tap(() => {
                    this.refreshTable();
                    this.messagesService.success('Eliminado correctamente');
                })
            )
            .subscribe({
                error: () => this.messagesService.error('Verifique que ningun elemento este en uso antes de eliminar')
            });
    }

    override refreshTable(): void {
        this.dbService.getTable(EssayTemplateDbTableContext.tableName, {
            relations: EssayTemplateDbTableContext.foreignTables,
            lazyLoadEvent: this.lazyLoadEvent,
            globalFilterColumns: GlobalFilterManager.transform(this.cols)
        });
    }

    override exportQuery$(): Observable<RequestTableResponse<EssayTemplate>> {
        return this.dbService.getTable$(EssayTemplateDbTableContext.tableName, {
            relations: EssayTemplateDbTableContext.foreignTables,
            // traemos la última búsqueda, sin paginar
            lazyLoadEvent: {
                ...this.lazyLoadEvent,
                first: 0,
                rows: undefined
            },
            globalFilterColumns: GlobalFilterManager.transform(this.cols)
        });
    }

    override exportDataTransform(data: RequestTableResponse<EssayTemplate>): any[] {
        // TODO
        return [];
    }
}
