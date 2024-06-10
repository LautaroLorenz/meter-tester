import { ChangeDetectionStrategy, Component, Input, forwardRef } from '@angular/core';
import { PdfReportComponent } from '../../../../models/business/class/pdf-report-component.model';
import {
    BootTestEssayStep,
    BootTestStandResult
} from '../../../../models/business/interafces/steps/boot-test-step.model';
import { PreparationEssayStep } from '../../../../models/business/interafces/steps/preparation-step.model';
import { StandStandResult } from '../../../../models/business/interafces/stand-result.model';
import { TC_AlignHorizontal, TableColumn } from '../../../../models/core/table-column.model';
import { Stand } from '../../../../models/business/interafces/stand.model';

@Component({
    selector: 'app-boot-test-pdf-report',
    templateUrl: './boot-test-pdf-report.component.html',
    styleUrls: ['./boot-test-pdf-report.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: PdfReportComponent,
            useExisting: forwardRef(() => BootTestPdfReportComponent)
        }
    ]
})
export class BootTestPdfReportComponent extends PdfReportComponent {
    @Input() essayStep!: BootTestEssayStep;
    @Input() preparationStep!: PreparationEssayStep;

    readonly resultsColumn: TableColumn<StandStandResult> = {
        alignHorizontal: TC_AlignHorizontal.Number,
        header: 'Impulsos',
        field: (item: StandStandResult): string => {
            const realItem = item as Stand | BootTestStandResult;
            return 'measuredPulses' in realItem ? realItem.measuredPulses?.toString() : '';
        }
    };
}
