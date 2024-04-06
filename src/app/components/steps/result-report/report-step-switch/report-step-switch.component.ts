import {
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewChild,
} from '@angular/core';
import { PdfPageComponent } from '../pdf-page/pdf-page.component';
import { PreparationEssayStep } from '../../../../models/business/interafces/steps/preparation-step.model';
import { PdfReportComponent } from '../../../../models/business/class/pdf-report-component.model';
import { EssayStep } from '../../../../models/business/interafces/essay-step.model';
import { Steps } from '../../../../models/business/enums/steps.model';

@Component({
  selector: 'app-report-step-switch',
  templateUrl: './report-step-switch.component.html',
  styleUrls: ['./report-step-switch.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportStepSwitchComponent {
  @Input() essayStep!: EssayStep;
  @Input() preparationStep!: PreparationEssayStep;
  @ViewChild(PdfReportComponent) stepPdfReport!: PdfReportComponent;

  readonly Steps = Steps;

  get pages(): PdfPageComponent[] {
    return this.stepPdfReport.pages.toArray();
  }
}
