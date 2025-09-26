import { ChangeDetectionStrategy, Component, Input, forwardRef } from '@angular/core';
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
export class IntegrationTestPdfReportComponent extends PdfReportComponent {
    @Input() essayStep!: IntegrationTestEssayStep;
    @Input() preparationStep!: PreparationEssayStep;

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
}
