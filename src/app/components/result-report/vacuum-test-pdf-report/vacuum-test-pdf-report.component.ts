import {
  ChangeDetectionStrategy,
  Component,
  Input,
  forwardRef,
} from '@angular/core';
import { VacuumTestEssayStep } from '../../../models/business/interafces/steps/vacuum-step.model';
import { PdfReportComponent } from '../../../models/business/class/pdf-report-component.model';

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
}
