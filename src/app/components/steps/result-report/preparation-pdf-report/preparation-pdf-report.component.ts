import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
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
import { ClientSettingsService } from '../../../../services/client-settings.service';
import { finalize } from 'rxjs';

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
    @Input() essayName?: string;
    @Input() executionDate?: string;
    @ViewChild('meterColumnTmp', { static: true }) meterColumnTmp!: TemplateRef<TableColumnTemplateContext<Stand>>;

    columns: TableColumn<Stand>[] = [];
    value: Stand[] = [];
    companyName = '';
    brandDescription = '';
    companyLogo = '';

    readonly meterConstantPipe = inject(MeterConstantPipe);
    readonly standMeterConstantPipe = inject(StandMeterConstantPipe);
    readonly clientSettingsService = inject(ClientSettingsService);
    readonly cdr = inject(ChangeDetectorRef);

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.preparationStep) {
            this.value = this.getValues(changes.preparationStep.currentValue as PreparationStep);
        }
    }

    ngOnInit(): void {
        // Cargar client-settings
        this.loadClientSettings();

        this.columns = [
            {
                header: 'Puesto',
                field: (item) => ('name' in item ? item.name : 'N/A'),
                alignHorizontal: TC_AlignHorizontal.Number,
                headerStyle: 'min-width: 50px;',
                customStyles: 'font-family: var(--font-monospace); font-weight: 500; font-size: 0.75rem;'
            },
            {
                header: 'Medidor',
                template: this.meterColumnTmp,
                headerStyle: 'min-width: 150px;'
            },
            {
                header: 'Nº de serie',
                field: (item) => ('serialNumber' in item ? item.serialNumber : ''),
                alignHorizontal: TC_AlignHorizontal.Text,
                headerStyle: 'min-width: 100px;',
                customStyles: 'font-family: var(--font-monospace); font-weight: 500; font-size: 0.75rem;'
            },
            {
                header: 'Año',
                field: (item) => ('yearOfProduction' in item ? item.yearOfProduction : ''),
                alignHorizontal: TC_AlignHorizontal.Number,
                headerStyle: 'min-width: 60px;',
                customStyles: 'font-family: var(--font-monospace); font-weight: 500; font-size: 0.75rem;'
            },
            {
                header: `Cte. ${this.meterConstantPipe.transform(MeterConstantEnum.Active)}`,
                field: (item): string =>
                    this.standMeterConstantPipe.transform(MeterConstantEnum.Active, item?.foreign?.meter),
                alignHorizontal: TC_AlignHorizontal.Alphanumeric,
                headerStyle: 'min-width: 100px; white-space: nowrap;',
                customStyles:
                    'font-family: var(--font-monospace); font-weight: 500; white-space: nowrap; font-size: 0.75rem;'
            },
            {
                header: `Cte. ${this.meterConstantPipe.transform(MeterConstantEnum.Reactive)}`,
                field: (item): string =>
                    this.standMeterConstantPipe.transform(MeterConstantEnum.Reactive, item?.foreign?.meter),
                alignHorizontal: TC_AlignHorizontal.Alphanumeric,
                headerStyle: 'min-width: 100px; white-space: nowrap;',
                customStyles:
                    'font-family: var(--font-monospace); font-weight: 500; white-space: nowrap; font-size: 0.75rem;'
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

    private loadClientSettings(): void {
        this.clientSettingsService
            .getClientSettings$()
            .pipe(finalize(() => this.cdr.detectChanges()))
            .subscribe({
                next: (settings) => {
                    this.companyName = settings.companyName;
                    this.brandDescription = settings.brandDescription;
                    this.companyLogo = 'assets/icons/company-logo.png';
                },
                error: () => {
                    // Usar valores por defecto en caso de error
                    this.companyName = '';
                    this.brandDescription = '';
                    this.companyLogo = '';
                }
            });
    }
}
