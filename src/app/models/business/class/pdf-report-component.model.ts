import {
  ChangeDetectionStrategy,
  Component,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { PdfPageComponent } from '../../../components/result-report/pdf-page/pdf-page.component';

@Component({
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export abstract class PdfReportComponent {
  @ViewChildren(PdfPageComponent) pages!: QueryList<PdfPageComponent>;
}
