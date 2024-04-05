import {
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewChild,
} from '@angular/core';
import { EssayStep } from '../../../models/business/interafces/essay-step.model';
import { Steps } from '../../../models/business/enums/steps.model';
import { PdfReportComponent } from '../../../models/business/class/pdf-report-component.model';
import { PdfPageComponent } from '../pdf-page/pdf-page.component';

@Component({
  selector: 'app-report-step-switch',
  templateUrl: './report-step-switch.component.html',
  styleUrls: ['./report-step-switch.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportStepSwitchComponent {
  @Input() essayStep!: EssayStep;
  @ViewChild(PdfReportComponent) stepPdfReport!: PdfReportComponent;

  readonly Steps = Steps;

  get pages(): PdfPageComponent[] {
    return this.stepPdfReport.pages.toArray();
  }
}
