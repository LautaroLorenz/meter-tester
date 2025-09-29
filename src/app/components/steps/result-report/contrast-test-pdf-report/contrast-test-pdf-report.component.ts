import { ChangeDetectionStrategy, Component, Input, forwardRef } from '@angular/core';
import { PdfReportComponent } from '../../../../models/business/class/pdf-report-component.model';
import {
    ContrastTestEssayStep,
    ContrastTestStandResult
} from '../../../../models/business/interafces/steps/contrast-test-step.model';
import { PreparationEssayStep } from '../../../../models/business/interafces/steps/preparation-step.model';
import { TC_AlignHorizontal, TableColumn } from '../../../../models/core/table-column.model';
import { StandStandResult } from '../../../../models/business/interafces/stand-result.model';
import { Stand } from '../../../../models/business/interafces/stand.model';
import { formatHeaderWithUnits } from '../../../../utils/table-utils';

@Component({
    selector: 'app-contrast-test-pdf-report',
    templateUrl: './contrast-test-pdf-report.component.html',
    styleUrls: ['./contrast-test-pdf-report.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: PdfReportComponent,
            useExisting: forwardRef(() => ContrastTestPdfReportComponent)
        }
    ]
})
export class ContrastTestPdfReportComponent extends PdfReportComponent {
    @Input() essayStep!: ContrastTestEssayStep;
    @Input() preparationStep!: PreparationEssayStep;

    readonly resultsColumn: TableColumn<StandStandResult> = {
        alignHorizontal: TC_AlignHorizontal.Number,
        header: formatHeaderWithUnits('Error [%]'),
        field: (item: StandStandResult): string => {
            const realItem = item as Stand | ContrastTestStandResult;
            return 'measuredError' in realItem ? realItem.measuredError?.toFixed(2) : '';
        },
        headerStyle: 'min-width:90px;font-size:15px;',
        customStyles: 'font-size:14px;'
    };
}
