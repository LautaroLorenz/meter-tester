import { Component, inject } from '@angular/core';
import { DatabaseService } from '../../services/database.service';
import {
    HistoryEssayStepStand,
    HistoryEssayStepStandDbTableContext
} from '../../models/business/database/history_essay_step_stand.model';
import { AbmPage } from '../../models/core/abm-page.model';
import { Observable } from 'rxjs';
import { GlobalFilterManager } from '../../models/core/global-filter-manager.model';
import {
    TC_AlignHorizontal,
    TC_FilterType,
    TC_MatchMode,
    TC_Operator,
    TableColumn
} from '../../models/core/table-column.model';
import { BrandDbTableContext } from '../../models/business/database/brand.model';
import { Meter, MeterDbTableContext } from '../../models/business/database/meter.model';
import { EnumAsOptionPipe } from '../../pipes/core/enum-as-option.pipe';
import { ResultStatus } from '../../models/business/enums/result-status.model';
import { RequestTableResponse } from '../../models/core/database.model';
import { DatePipe } from '@angular/common';
import { TranslateEnumPipe } from '../../pipes/core/translate-enum.pipe';

@Component({
    templateUrl: './history-essay-step-stand.component.html',
    styleUrls: ['./history-essay-step-stand.component.scss']
})
export class HistoryEssayStepStandComponent extends AbmPage<HistoryEssayStepStand> {
    meterDetailDialogVisible = false;
    selectedMeter: Meter | undefined;

    readonly EnumAsOptionPipe = inject(EnumAsOptionPipe);
    readonly title: string = 'Historial de ejecución';
    readonly cols: TableColumn<HistoryEssayStepStand>[] = [
        {
            templateName: 'saved_time',
            template: undefined, // se inicializa en abm.component.ts
            header: 'Realizado',
            sortable: `${HistoryEssayStepStandDbTableContext.tableName}.saved_time`,
            filter: {
                field: `${HistoryEssayStepStandDbTableContext.tableName}.saved_time`,
                type: TC_FilterType.date,
                showMatchModes: false,
                matchMode: TC_MatchMode.range,
                operator: TC_Operator.and,
                showAddButton: false,
                showOperator: false,
                hideOnClear: true,
                showApplyButton: false,
                showClearButton: true,
                maxConstraints: 1
            }
        },
        {
            field: 'essay_name',
            header: 'Ensayo',
            sortable: `${HistoryEssayStepStandDbTableContext.tableName}.essay_name`,
            globalFilter: `${HistoryEssayStepStandDbTableContext.tableName}.essay_name`,
            alignHorizontal: TC_AlignHorizontal.Text
        },
        {
            field: 'step_name',
            header: 'Paso',
            sortable: `${HistoryEssayStepStandDbTableContext.tableName}.step_name`,
            globalFilter: `${HistoryEssayStepStandDbTableContext.tableName}.step_name`,
            alignHorizontal: TC_AlignHorizontal.Text
        },
        {
            field: 'foreign.meter.foreign.brand.name',
            header: 'Marca',
            sortable: `${BrandDbTableContext.tableName}.name`,
            globalFilter: `${BrandDbTableContext.tableName}.name`,
            alignHorizontal: TC_AlignHorizontal.Text
        },
        {
            templateName: 'model',
            template: undefined, // se inicializa en abm.component.ts
            header: 'Modelo',
            sortable: `${MeterDbTableContext.tableName}.model`,
            globalFilter: `${MeterDbTableContext.tableName}.model`,
            alignHorizontal: TC_AlignHorizontal.Text
        },
        {
            field: 'serial_number',
            header: 'Número de serie',
            sortable: `${HistoryEssayStepStandDbTableContext.tableName}.serial_number`,
            globalFilter: `${HistoryEssayStepStandDbTableContext.tableName}.serial_number`,
            alignHorizontal: TC_AlignHorizontal.Text
        },
        {
            field: 'year_of_production',
            header: 'Año',
            sortable: `${HistoryEssayStepStandDbTableContext.tableName}.year_of_production`,
            globalFilter: `${HistoryEssayStepStandDbTableContext.tableName}.year_of_production`,
            alignHorizontal: TC_AlignHorizontal.Number
        },
        {
            field: 'result_value',
            header: 'Valor obtenido',
            sortable: `${HistoryEssayStepStandDbTableContext.tableName}.result_value`,
            globalFilter: `${HistoryEssayStepStandDbTableContext.tableName}.result_value`,
            alignHorizontal: TC_AlignHorizontal.Number
        },
        {
            field: 'result_unit',
            header: 'Unidad',
            sortable: `${HistoryEssayStepStandDbTableContext.tableName}.result_unit`,
            globalFilter: `${HistoryEssayStepStandDbTableContext.tableName}.result_unit`,
            alignHorizontal: TC_AlignHorizontal.Text
        },
        {
            templateName: 'result_status_enum',
            template: undefined, // se inicializa en abm.component.ts
            header: 'Resultado',
            sortable: `${HistoryEssayStepStandDbTableContext.tableName}.result_status_enum`,
            filter: {
                field: `${HistoryEssayStepStandDbTableContext.tableName}.result_status_enum`,
                type: TC_FilterType.dropdown,
                showMatchModes: false,
                matchMode: TC_MatchMode.equals,
                operator: TC_Operator.and,
                showAddButton: false,
                showOperator: false,
                hideOnClear: true,
                options: this.EnumAsOptionPipe.transform('ResultStatus', ResultStatus).filter(
                    ({ value }) => value === ResultStatus.Approved || value === ResultStatus.Failed
                ),
                showClear: false,
                showApplyButton: false,
                showClearButton: true,
                maxConstraints: 1
            }
        }
    ];
    readonly historyEssayRows$: Observable<HistoryEssayStepStand[]>;
    readonly excelExportFileName = 'historial de ejecución';

    private datePipe = inject(DatePipe);
    private translateEnumPipe = inject(TranslateEnumPipe);

    constructor(private readonly dbService: DatabaseService<HistoryEssayStepStand>) {
        super(dbService, HistoryEssayStepStandDbTableContext);
        this.historyEssayRows$ = this.refreshDataWhenDatabaseReply$(HistoryEssayStepStandDbTableContext.tableName);
    }

    override refreshTable(): void {
        this.dbService.getTable(HistoryEssayStepStandDbTableContext.tableName, {
            relations: HistoryEssayStepStandDbTableContext.foreignTables,
            lazyLoadEvent: this.lazyLoadEvent,
            globalFilterColumns: GlobalFilterManager.transform(this.cols)
        });
    }

    override exportQuery$(): Observable<RequestTableResponse<HistoryEssayStepStand>> {
        return this.dbService.getTable$(HistoryEssayStepStandDbTableContext.tableName, {
            relations: HistoryEssayStepStandDbTableContext.foreignTables,
            // traemos la última búsqueda, sin paginar
            lazyLoadEvent: {
                ...this.lazyLoadEvent,
                first: 0,
                rows: undefined
            },
            globalFilterColumns: GlobalFilterManager.transform(this.cols)
        });
    }

    override exportDataTransform(data: RequestTableResponse<HistoryEssayStepStand>): any[] {
        return data.rows.map((row) => ({
            'Realizado': this.datePipe.transform(row.saved_time, 'dd/MM/yyyy'),
            'Ensayo': row.essay_name,
            'Paso': row.step_name,
            'Marca': row.foreign.meter.foreign.brand.name,
            'Modelo': row.foreign.meter.model,
            'Número de serie': row.serial_number,
            'Año de fabricación': row.year_of_production,
            'Valor obtenido': row.result_value,
            'Unidad': row.result_unit,
            'Resultado': this.translateEnumPipe.transform(row.result_status_enum, 'ResultStatus')
        }));
    }

    openMeterDialog(meter: Meter): void {
        this.selectedMeter = meter;
        this.meterDetailDialogVisible = true;
    }

    closeMeterDialog(): void {
        this.meterDetailDialogVisible = false;
        this.selectedMeter = undefined;
    }
}
