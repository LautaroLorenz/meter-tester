import {
  AfterViewInit,
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
import { HistoryEssay } from '../../../models/business/database/history_essay.model';
import { HistoryEssayService } from '../../../services/history-essay.service';
import {
  tap,
  take,
  map,
  catchError,
  finalize,
  concat,
  reduce,
  timer,
  switchMap,
} from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { throwError } from 'rxjs/internal/observable/throwError';
import { NavigationService } from '../../../services/navigation.service';
import { PageUrlName } from '../../../models/business/enums/page-name.model';
import { StaticsService } from '../../../services/statics.service';
import { Metric } from '../../../models/business/enums/metric.model';

@Component({
  selector: 'app-report-major-step',
  templateUrl: './report-major-step.component.html',
  styleUrls: ['./report-major-step.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportMajorStepComponent implements OnInit, AfterViewInit {
  @ViewChildren(ReportStepSwitchComponent)
  steps!: QueryList<ReportStepSwitchComponent>;

  isFileDownloaded = false;
  isDownloading = false;
  isSaving = false;
  fileName!: string;
  readonly runEssay: RunEssay;
  readonly executionSteps: EssayStep[];
  readonly preparationStep: PreparationEssayStep;

  constructor(
    private readonly runEssayService: RunEssayService,
    private readonly blockUIService: BlockUIService,
    private readonly messagesService: MessagesService,
    private readonly cd: ChangeDetectorRef,
    private readonly historyEssayService: HistoryEssayService,
    private readonly navigationService: NavigationService,
    private readonly staticsService: StaticsService
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

  ngAfterViewInit(): void {
    // las estádisticas se guardan independientemente de que el usuario guarde en el historial.
    timer(100)
      .pipe(switchMap(() => this.saveOnStatics$()))
      .subscribe();
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

  exit(): void {
    this.navigationService.back({ targetPage: PageUrlName.availableTest });
  }

  saveAndExit(): void {
    this.saveOnHistory$().subscribe(() => this.exit());
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

  /**
   * guardar estadísticas
   */
  private saveOnStatics$(): Observable<number[]> {
    // poner todos los obsersables en un array, y ejecutar todos juntos uno por uno.
    const observables: Observable<number>[] = [];

    // guardar los stands utilizados
    const standsUsed = this.runEssayService
      .getActiveStands(this.preparationStep)
      .map(({ index }) => ({ standIndex: index.toString() }));
    observables.push(
      this.staticsService.increment$(Metric.standUsed, standsUsed)
    );

    // TODO guardar
    // - modelos de medidores que aprobaron
    // - modelos de medidores que desaprobaron
    // - modelos de medidores que se usaron
    // - ensayo que se ejecutó
    // - steps que se ejecutaron

    // almacenamiento de estadisticas generadas
    return concat(...observables).pipe(
      reduce((acc, value) => {
        // Aquí puedes procesar cada respuesta y agregarla a acc
        acc.push(value);
        return acc;
      }, [] as number[]),
      catchError((err: Error) => {
        this.messagesService.error('No se pudo guardar estadísticas');
        return throwError(() => err);
      })
    );
  }

  /**
   * guardar ejecución en la base de datos
   */
  private saveOnHistory$(): Observable<HistoryEssay[]> {
    // bloquear la UI mientras está generando el historial.
    this.isSaving = true;
    this.blockUIService.setBlocked(true);
    this.cd.detectChanges();
    const savedTime = new Date().getTime();
    let rows: Omit<HistoryEssay, 'id' | 'foreign'>[] = [];
    this.executionSteps.forEach((step) => {
      this.runEssayService
        .getActiveStands(this.preparationStep)
        .forEach(({ index, stand }) => {
          const historyEssay: Omit<HistoryEssay, 'id' | 'foreign'> = {
            saved_time: savedTime,
            essay_name: this.runEssay.essayName,
            step_name: step.form_control_raw.name,
            meter_id: stand.meter.id,
            serial_number: stand.serialNumber,
            year_of_production: stand.yearOfProduction,
            result_status_enum: step.standResults[index].resultStatus,
          };
          rows = rows.concat(historyEssay);
        });
    });

    return this.historyEssayService.saveHistoryEssay$(rows).pipe(
      take(1),
      tap(() => {
        this.messagesService.success('Guardado correctamente');
      }),
      map(({ historyEssayRows }) => historyEssayRows),
      finalize(() => {
        this.isSaving = false;
        this.blockUIService.setBlocked(false);
        this.cd.detectChanges();
      }),
      catchError((err: Error) => {
        this.messagesService.error(
          'No se pudo guardar el historial en la base de datos'
        );
        return throwError(() => err);
      })
    );
  }
}
