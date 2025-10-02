import {
    ChangeDetectionStrategy,
    Component,
    Input,
    OnChanges,
    OnInit,
    SimpleChanges,
    TemplateRef,
    ViewChild,
    inject
} from '@angular/core';
import { PreparationStep } from '../../models/business/interafces/steps/preparation-step.model';
import { StandResult, StandStandResult } from '../../models/business/interafces/stand-result.model';
import { TC_AlignHorizontal, TableColumn, TableColumnTemplateContext } from '../../models/core/table-column.model';
import { StandMeterConstantPipe } from '../../pipes/business/stand-meter-constant.pipe';
import { MeterConstantEnum } from '../../models/business/constants/meter-constant.model';
import { MeterConstantPipe } from '../../pipes/business/meter-constant.pipe';
import { formatHeaderWithUnits } from '../../utils/table-utils';

@Component({
    selector: 'app-stands-result',
    templateUrl: './stands-result.component.html',
    styleUrls: ['./stands-result.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class StandsResultComponent implements OnInit, OnChanges {
    @Input() preparationStep!: PreparationStep;
    @Input() results!: StandResult[];
    @Input() resultsColumn!: TableColumn<StandStandResult>;
    @Input() stepMeterConstant!: MeterConstantEnum;
    @Input() resultStatusColumnTemplate: TemplateRef<TableColumnTemplateContext<StandStandResult>> | undefined;
    @Input() additionalColumns: TableColumn<StandStandResult>[] = [];
    @Input() additionalColumnsPosition: 'before' | 'after' = 'before';
    @Input() limit: number | null = null;
    @Input() offset = 0;
    @Input() compactMode = false;

    @ViewChild('meterColumnTmp', { static: true })
    meterColumnTmp!: TemplateRef<TableColumnTemplateContext<StandStandResult>>;
    @ViewChild('resultStatusColumnTmp', { static: true })
    resultStatusColumnTmp!: TemplateRef<TableColumnTemplateContext<StandStandResult>>;

    value: StandStandResult[] = [];
    columns: TableColumn<StandStandResult>[] = [];
    readonly meterConstantPipe = inject(MeterConstantPipe);
    readonly standMeterConstantPipe = inject(StandMeterConstantPipe);

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.results) {
            this.value = this.getValues(changes.results.currentValue as StandResult[], this.preparationStep);
        }
        if (changes.preparationStep) {
            this.value = this.getValues(this.results, changes.preparationStep.currentValue as PreparationStep);
        }
    }

    ngOnInit(): void {
        this.columns = this.getColumns();
    }

    private getValues(results: StandResult[], preparationStep: PreparationStep): StandStandResult[] {
        if (!results?.length) {
            return [];
        }
        if (!preparationStep) {
            return [];
        }
        if (!preparationStep.form_control_raw?.length) {
            return [];
        }
        const formatedResults = results.map((result, index) => ({
            ...result,
            ...preparationStep.form_control_raw[index]
        }));
        // calcular los elementos visibles
        const off = Math.max(0, this.offset ?? 0);
        const lim = this.limit ?? formatedResults.length;
        const start = Math.min(off, formatedResults.length);
        const end = Math.min(start + Math.max(0, lim), formatedResults.length);
        return formatedResults.slice(start, end);
    }

    private getColumns(): TableColumn<StandStandResult>[] {
        const columns: TableColumn<StandStandResult>[] = [];
        columns.push({
            header: formatHeaderWithUnits('Puesto'),
            field: (item) => (('standIndex' in item ? item.standIndex : 0) + 1).toString().padStart(2, '0'),
            alignHorizontal: TC_AlignHorizontal.Number,
            headerStyle: 'min-width: 50px;',
            customStyles: 'font-family: var(--font-monospace); font-weight: 500; font-size: 0.75rem;'
        });
        if (!this.compactMode) {
            columns.push({
                header: formatHeaderWithUnits('Medidor'),
                template: this.meterColumnTmp,
                headerStyle: 'min-width: 150px;'
            });
        }
        columns.push({
            header: formatHeaderWithUnits('Nº de serie'),
            field: (item) => ('serialNumber' in item ? item.serialNumber : ''),
            alignHorizontal: TC_AlignHorizontal.Text,
            headerStyle: 'min-width: 100px;',
            customStyles: 'font-family: var(--font-monospace); font-weight: 500; font-size: 0.75rem;'
        });

        // Agregar columnas adicionales antes del error si se especifica
        if (this.additionalColumnsPosition === 'before' && this.additionalColumns.length > 0) {
            columns.push(...this.additionalColumns);
        }

        if (!this.compactMode) {
            columns.push({
                header: formatHeaderWithUnits('Año'),
                field: (item) => ('yearOfProduction' in item ? item.yearOfProduction : ''),
                alignHorizontal: TC_AlignHorizontal.Number,
                headerStyle: 'min-width: 60px;',
                customStyles: 'font-family: var(--font-monospace); font-weight: 500; font-size: 0.75rem;'
            });
        }
        if (!this.compactMode) {
            columns.push({
                header: formatHeaderWithUnits(`Cte. ${this.meterConstantPipe.transform(this.stepMeterConstant)}`),
                field: (item): string => {
                    if (this.stepMeterConstant === undefined) {
                        return '';
                    }
                    if (!('foreign' in item) || !item.foreign?.meter) {
                        return '';
                    }
                    return this.standMeterConstantPipe.transform(this.stepMeterConstant, item?.foreign.meter);
                },
                alignHorizontal: TC_AlignHorizontal.Alphanumeric,
                headerStyle: 'min-width: 100px; white-space: nowrap;',
                customStyles:
                    'font-family: var(--font-monospace); font-weight: 500; white-space: nowrap; font-size: 0.75rem;'
            });
        }
        columns.push({
            ...this.resultsColumn,
            headerStyle: (this.resultsColumn.headerStyle || '') + ' min-width: 80px;',
            customStyles:
                (this.resultsColumn.customStyles || '') +
                ' font-family: var(--font-monospace); font-weight: 500; font-size: 0.75rem;'
        });

        // Agregar columnas adicionales después del error si se especifica
        if (this.additionalColumnsPosition === 'after' && this.additionalColumns.length > 0) {
            columns.push(...this.additionalColumns);
        }
        columns.push({
            header: formatHeaderWithUnits('Resultado'),
            template: this.resultStatusColumnTemplate || this.resultStatusColumnTmp,
            headerStyle: 'min-width: 80px;'
        });

        return columns;
    }
}
