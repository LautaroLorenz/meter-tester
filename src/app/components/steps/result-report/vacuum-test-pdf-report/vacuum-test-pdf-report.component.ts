import {
  ChangeDetectionStrategy,
  Component,
  Input,
  forwardRef,
} from '@angular/core';
import { PdfReportComponent } from '../../../../models/business/class/pdf-report-component.model';
import {
  VacuumTestEssayStep,
  VacuumTestStandResult,
} from '../../../../models/business/interafces/steps/vacuum-step.model';
import { PreparationEssayStep } from '../../../../models/business/interafces/steps/preparation-step.model';
import { StandStandResult } from '../../../../models/business/interafces/stand-result.model';
import {
  TC_AlignHorizontal,
  TableColumn,
} from '../../../../models/core/table-column.model';
import { Stand } from '../../../../models/business/interafces/stand.model';

@Component({
  selector: 'app-vacuum-test-pdf-report',
  templateUrl: './vacuum-test-pdf-report.component.html',
  styleUrls: ['./vacuum-test-pdf-report.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: PdfReportComponent,
      useExisting: forwardRef(() => VacuumTestPdfReportComponent),
    },
  ],
})
export class VacuumTestPdfReportComponent extends PdfReportComponent {
  @Input() essayStep!: VacuumTestEssayStep;
  @Input() preparationStep!: PreparationEssayStep;

  readonly resultsColumn: TableColumn<StandStandResult> = {
    alignHorizontal: TC_AlignHorizontal.Number,
    header: 'Impulsos',
    field: (item: StandStandResult): string => {
      const realItem = item as Stand | VacuumTestStandResult;
      return 'measuredPulses' in realItem
        ? realItem.measuredPulses?.toString()
        : '';
    },
  };
}
