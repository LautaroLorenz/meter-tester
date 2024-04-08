import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { RunEssayService } from '../../../services/run-essay.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { RunEssay } from '../../../models/business/interafces/run-essay.model';
import { BlockUIService } from '../../../services/block-ui.service';
import { MessagesService } from '../../../services/messages.service';
import { EssayStep } from '../../../models/business/interafces/essay-step.model';
import { MajorStepsDirector } from '../../../models/business/class/major-steps-director.model';
import { MajorSteps } from '../../../models/business/enums/major-steps.model';
import { PreparationEssayStep } from '../../../models/business/interafces/steps/preparation-step.model';
import { ReportStepSwitchComponent } from '../../steps/result-report/report-step-switch/report-step-switch.component';
import { PdfPageComponent } from '../../steps/result-report/pdf-page/pdf-page.component';

@Component({
  selector: 'app-report-major-step',
  templateUrl: './report-major-step.component.html',
  styleUrls: ['./report-major-step.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportMajorStepComponent implements OnInit {
  @ViewChildren(ReportStepSwitchComponent)
  steps!: QueryList<ReportStepSwitchComponent>;

  isFileDownloaded = false;
  isDownloading = false;
  fileName!: string;
  readonly runEssay: RunEssay;
  readonly executionSteps: EssayStep[];
  readonly preparationStep: PreparationEssayStep;

  constructor(
    private readonly runEssayService: RunEssayService,
    private readonly blockUIService: BlockUIService,
    private readonly messagesService: MessagesService,
    private readonly cd: ChangeDetectorRef
  ) {
    this.runEssay = this.runEssayService.runEssayForm.getRawValue() as RunEssay;
    this.executionSteps = MajorStepsDirector.stepsByMajorStep(
      this.runEssay.essaySteps,
      MajorSteps.Execution
    );
    this.preparationStep = MajorStepsDirector.stepsByMajorStep(
      this.runEssay.essaySteps,
      MajorSteps.Preparation
    )?.[0] as PreparationEssayStep;
  }

  ngOnInit(): void {
    this.fileName = this.getFileName();
  }

  downloadPDF(): void {
    this.isDownloading = true;
    this.blockUIService.setBlocked(true);
    this.cd.detectChanges();
    this.createPDF(this.fileName)
      .then(() => {
        this.blockUIService.setBlocked(false);
        this.isDownloading = false;
        this.isFileDownloaded = true;
        this.cd.detectChanges();
      })
      .catch(() => {
        this.messagesService.error('No se pudo crear el reporte');
      });
  }

  private async createPDF(fileName: string): Promise<void> {
    const pages = this.getPages();
    const PDF = new jsPDF('p', 'mm', 'a4', true);
    for (let index = 0; index < pages.length; index++) {
      const page = pages[index];
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
    return PDF.save(fileName, { returnPromise: true });
  }

  private getFileName(): string {
    const date = new Date();
    const day = date.getDay().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().padStart(4, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const formatedDate = `${day}-${month}-${year}-${hours}-${minutes}-${seconds}`;
    return `reporte_${this.runEssay.essayName}_${formatedDate}.pdf`;
  }

  private getPages(): PdfPageComponent[] {
    return this.steps.reduce<PdfPageComponent[]>(
      (acc, { pages }) => (acc = acc.concat(pages)),
      []
    );
  }
}
