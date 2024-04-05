import {
  ChangeDetectionStrategy,
  Component,
  Input,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { EssayStep } from '../../../models/business/interafces/essay-step.model';
import { PdfPageComponent } from '../pdf-page/pdf-page.component';

@Component({
  selector: 'app-report-step-switch',
  templateUrl: './report-step-switch.component.html',
  styleUrls: ['./report-step-switch.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportStepSwitchComponent {
  @Input() essayStep!: EssayStep;
  @ViewChildren(PdfPageComponent) pages!: QueryList<PdfPageComponent>;
}
