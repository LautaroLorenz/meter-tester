import {
    ChangeDetectionStrategy,
    Component,
    forwardRef,
    inject,
    Input,
    OnChanges,
    OnInit,
    SimpleChanges,
    TemplateRef,
    ViewChild
} from '@angular/core';
import { PdfReportComponent } from '../../../../models/business/class/pdf-report-component.model';
import {
    PreparationEssayStep,
    PreparationStep
} from '../../../../models/business/interafces/steps/preparation-step.model';
import {
    TableColumn,
    TableColumnTemplateContext,
    TC_AlignHorizontal
} from '../../../../models/core/table-column.model';
import { Stand } from '../../../../models/business/interafces/stand.model';
import { MeterConstantEnum } from '../../../../models/business/constants/meter-constant.model';
import { MeterConstantPipe } from '../../../../pipes/business/meter-constant.pipe';
import { StandMeterConstantPipe } from '../../../../pipes/business/stand-meter-constant.pipe';

@Component({
    selector: 'app-preparation-pdf-report',
    templateUrl: './preparation-pdf-report.component.html',
    styleUrls: ['./preparation-pdf-report.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: PdfReportComponent,
            useExisting: forwardRef(() => PreparationPdfReportComponent)
        }
    ]
})
export class PreparationPdfReportComponent extends PdfReportComponent implements OnInit, OnChanges {
    @Input() preparationStep!: PreparationEssayStep;
    @ViewChild('meterColumnTmp', { static: true }) meterColumnTmp!: TemplateRef<TableColumnTemplateContext<Stand>>;

    columns: TableColumn<Stand>[] = [];
    value: Stand[] = [];

    readonly meterConstantPipe = inject(MeterConstantPipe);
    readonly standMeterConstantPipe = inject(StandMeterConstantPipe);

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.preparationStep) {
            this.value = this.getValues(changes.preparationStep.currentValue as PreparationStep);
        }
    }

    ngOnInit(): void {
        this.columns = [
            {
                header: 'Puesto',
                field: (item) => ('name' in item ? item.name : 'N/A'),
                alignHorizontal: TC_AlignHorizontal.Number,
                headerStyle: 'font-size:15px;',
                customStyles: 'font-size:14px;font-family:monospace;'
            },
            {
                header: 'Medidor',
                template: this.meterColumnTmp,
                headerStyle: 'font-size:15px;'
            },
            {
                header: 'Nº de serie',
                field: (item) => ('serialNumber' in item ? item.serialNumber : ''),
                alignHorizontal: TC_AlignHorizontal.Text,
                headerStyle: 'min-width:104px;font-size:15px;',
                customStyles: 'font-size:14px;'
            },
            {
                header: 'Año',
                field: (item) => ('yearOfProduction' in item ? item.yearOfProduction : ''),
                alignHorizontal: TC_AlignHorizontal.Number,
                headerStyle: 'font-size:15px;',
                customStyles: 'font-size:14px;'
            },
            {
                header: `Cte. ${this.meterConstantPipe.transform(MeterConstantEnum.Active)}`,
                field: (item): string =>
                    this.standMeterConstantPipe.transform(MeterConstantEnum.Active, item?.foreign.meter),
                alignHorizontal: TC_AlignHorizontal.Alphanumeric,
                headerStyle: 'min-width:119px;white-space:nowrap;',
                customStyles: 'font-size:14px;white-space:nowrap;'
            },
            {
                header: `Cte. ${this.meterConstantPipe.transform(MeterConstantEnum.Reactive)}`,
                field: (item): string =>
                    this.standMeterConstantPipe.transform(MeterConstantEnum.Reactive, item?.foreign.meter),
                alignHorizontal: TC_AlignHorizontal.Alphanumeric,
                headerStyle: 'min-width:119px;white-space:nowrap;',
                customStyles: 'font-size:14px;white-space:nowrap;'
            }
        ];
    }

    private getValues(preparationStep: PreparationStep): Stand[] {
        if (!preparationStep) {
            return [];
        }
        if (!preparationStep.form_control_raw?.length) {
            return [];
        }
        return preparationStep.form_control_raw;
    }
}
