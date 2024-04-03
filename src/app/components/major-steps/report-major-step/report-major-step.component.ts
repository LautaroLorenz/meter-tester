import {
  ChangeDetectionStrategy,
  Component,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { RunEssayService } from '../../../services/run-essay.service';
import { EssayStep } from '../../../models/business/interafces/essay-step.model';
import { Observable, tap } from 'rxjs';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { PdfPageComponent } from '../../result-report/pdf-page/pdf-page.component';

@Component({
  selector: 'app-report-major-step',
  templateUrl: './report-major-step.component.html',
  styleUrls: ['./report-major-step.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportMajorStepComponent {
  @ViewChildren(PdfPageComponent) pages!: QueryList<PdfPageComponent>;

  executionSteps: EssayStep[] | undefined;
  preparationStep: EssayStep | undefined;

  constructor(private readonly runEssayService: RunEssayService) {}

  get executionSteps$(): Observable<EssayStep[]> {
    return this.runEssayService.executionSteps$.pipe(
      tap((executionSteps) => (this.executionSteps = executionSteps))
    );
  }

  get preparationStep$(): Observable<EssayStep> {
    return this.runEssayService.preparationStep$.pipe(
      tap((preparationStep) => (this.preparationStep = preparationStep))
    );
  }

  // TODO
  // 1. un cargando
  // 2. nombre del reporte
  // 3. contenido del reporte
  async createPDF(): Promise<jsPDF> {
    const PDF = new jsPDF('p', 'mm', 'a4', true);
    for (let index = 0; index < this.pages.length; index++) {
      const page = this.pages.get(index) as PdfPageComponent;
      if (index > 0) {
        PDF.addPage();
      }
      const canvas = await html2canvas(page.html, { scale: 3 });
      const imageGeneratedFromTemplate = canvas.toDataURL('image/png');
      const width = PDF.internal.pageSize.getWidth();
      const height = PDF.internal.pageSize.getHeight();
      PDF.addImage(
        imageGeneratedFromTemplate,
        'PNG',
        0,
        0,
        width,
        height,
        undefined,
        'FAST'
      );
    }
    return PDF.save(`reporte-${new Date().getTime()}.pdf`);
  }
}
