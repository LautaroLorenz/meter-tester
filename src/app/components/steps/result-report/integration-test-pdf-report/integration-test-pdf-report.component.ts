import { ChangeDetectionStrategy, Component, Input, forwardRef, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { PdfReportComponent } from '../../../../models/business/class/pdf-report-component.model';
import {
    IntegrationTestEssayStep,
    IntegrationTestStandResult
} from '../../../../models/business/interafces/steps/integration-test-step.model';
import { PreparationEssayStep } from '../../../../models/business/interafces/steps/preparation-step.model';
import { TC_AlignHorizontal, TableColumn } from '../../../../models/core/table-column.model';
import { StandStandResult } from '../../../../models/business/interafces/stand-result.model';
import { Stand } from '../../../../models/business/interafces/stand.model';

@Component({
    selector: 'app-integration-test-pdf-report',
    templateUrl: './integration-test-pdf-report.component.html',
    styleUrls: ['./integration-test-pdf-report.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: PdfReportComponent,
            useExisting: forwardRef(() => IntegrationTestPdfReportComponent)
        }
    ]
})
export class IntegrationTestPdfReportComponent extends PdfReportComponent implements OnInit, OnChanges {
    @Input() essayStep!: IntegrationTestEssayStep;
    @Input() preparationStep!: PreparationEssayStep;

    showIntegratorColumns = false;
    additionalColumns: TableColumn<StandStandResult>[] = [];

    readonly resultsColumn: TableColumn<StandStandResult> = {
        alignHorizontal: TC_AlignHorizontal.Number,
        header: 'Error [%]',
        field: (item: StandStandResult): string => {
            const realItem = item as Stand | IntegrationTestStandResult;
            return 'calculatedError' in realItem ? realItem.calculatedError?.toFixed(2) : '';
        },
        headerStyle: 'min-width:90px;font-size:15px;',
        customStyles: 'font-size:14px;'
    };

    ngOnInit(): void {
        this.checkIntegratorValues();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.essayStep || changes.preparationStep) {
            this.checkIntegratorValues();
        }
    }

    private checkIntegratorValues(): void {
        if (!this.essayStep?.standResults || !this.preparationStep?.form_control_raw) {
            this.showIntegratorColumns = false;
            this.additionalColumns = [];
            return;
        }

        // Verificar si algún stand tiene valores de initialIntegrator y finalIntegrator
        const hasIntegratorValues = this.essayStep.standResults.some((result, index) => {
            const stand = this.preparationStep.form_control_raw[index];
            if (!stand?.isActive) return false;

            const integrationResult = result as IntegrationTestStandResult;
            return (
                integrationResult.initialIntegrator !== null &&
                integrationResult.initialIntegrator !== undefined &&
                integrationResult.finalIntegrator !== null &&
                integrationResult.finalIntegrator !== undefined
            );
        });

        this.showIntegratorColumns = hasIntegratorValues;

        if (hasIntegratorValues) {
            this.additionalColumns = [
                {
                    header: 'Integrador inicial [kWh]',
                    field: (item: StandStandResult): string => {
                        const realItem = item as Stand | IntegrationTestStandResult;
                        return 'initialIntegrator' in realItem &&
                            realItem.initialIntegrator !== null &&
                            realItem.initialIntegrator !== undefined
                            ? realItem.initialIntegrator.toFixed(1)
                            : '';
                    },
                    alignHorizontal: TC_AlignHorizontal.Number,
                    headerStyle: 'min-width: 120px; width: 120px; font-size: 15px;',
                    customStyles: 'font-family: monospace; font-weight: 500; font-size: 14px;'
                },
                {
                    header: 'Integrador final [kWh]',
                    field: (item: StandStandResult): string => {
                        const realItem = item as Stand | IntegrationTestStandResult;
                        return 'finalIntegrator' in realItem &&
                            realItem.finalIntegrator !== null &&
                            realItem.finalIntegrator !== undefined
                            ? realItem.finalIntegrator.toFixed(1)
                            : '';
                    },
                    alignHorizontal: TC_AlignHorizontal.Number,
                    headerStyle: 'min-width: 120px; width: 120px; font-size: 15px;',
                    customStyles: 'font-family: monospace; font-weight: 500; font-size: 14px;'
                }
            ];
        } else {
            this.additionalColumns = [];
        }
    }
}
