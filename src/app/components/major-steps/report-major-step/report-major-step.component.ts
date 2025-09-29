import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnInit,
    QueryList,
    ViewChild,
    ViewChildren
} from '@angular/core';
import { RunEssayService } from '../../../services/run-essay.service';
import { RunEssay } from '../../../models/business/interafces/run-essay.model';
import { BlockUIService } from '../../../services/block-ui.service';
import { MessagesService } from '../../../services/messages.service';
import { PdfGenerationService } from '../../../services/pdf-generation.service';
import { EssayStep } from '../../../models/business/interafces/essay-step.model';
import { MajorStepsDirector } from '../../../models/business/class/major-steps-director.model';
import { MajorSteps } from '../../../models/business/enums/major-steps.model';
import { PreparationEssayStep } from '../../../models/business/interafces/steps/preparation-step.model';
import { ReportStepSwitchComponent } from '../../steps/result-report/report-step-switch/report-step-switch.component';
import { PdfPageComponent } from '../../steps/result-report/pdf-page/pdf-page.component';
import { HistoryEssayStepStand } from '../../../models/business/database/history_essay_step_stand.model';
import { HistoryEssayService } from '../../../services/history-essay.service';
import { tap, take, catchError, finalize, concat, reduce, timer, switchMap } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { throwError } from 'rxjs/internal/observable/throwError';
import { NavigationService } from '../../../services/navigation.service';
import { PageUrlName } from '../../../models/business/enums/page-name.model';
import { StaticsService } from '../../../services/statics.service';
import { Metric } from '../../../models/business/enums/metric.model';
import { ResultStatus } from '../../../models/business/enums/result-status.model';
import { Tags } from '../../../models/business/database/static.model';
import { HistoryEssay } from '../../../models/business/database/history-essay.model';
import { CalculatorComponent } from '../../machine/calculator/calculator.component';
import { StepResultUnit, StepResultUnitEnum } from '../../../models/business/constants/step-result-unit.model';
import { StepStatus } from '../../../models/business/enums/step-status.model';

@Component({
    selector: 'app-report-major-step',
    templateUrl: './report-major-step.component.html',
    styleUrls: ['./report-major-step.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportMajorStepComponent implements OnInit, AfterViewInit {
    @ViewChildren(ReportStepSwitchComponent)
    steps!: QueryList<ReportStepSwitchComponent>;
    @ViewChild('calculator', { static: true }) calculator!: CalculatorComponent;

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
        private readonly staticsService: StaticsService,
        private readonly pdfGenerationService: PdfGenerationService
    ) {
        this.runEssay = this.runEssayService.runEssayForm.getRawValue() as RunEssay;
        this.executionSteps = MajorStepsDirector.stepsByMajorStep(
            this.runEssay.essaySteps,
            MajorSteps.Execution
        ).filter(({ executedStatus }) => executedStatus === StepStatus.Done);
        this.preparationStep = MajorStepsDirector.stepsByMajorStep(
            this.runEssay.essaySteps,
            MajorSteps.Preparation
        )?.[0] as PreparationEssayStep;
    }

    ngOnInit(): void {
        if (!this.executionSteps?.length) {
            this.exit();
        }
        this.fileName = this.pdfGenerationService.generateFileName('reporte', this.runEssay.essayName);
        // reseteamos el valor que se esta mostrando para cada puesto en el calculador
        this.calculator.reset$(this.runEssayService.getActiveStands(this.preparationStep)).subscribe();
    }

    ngAfterViewInit(): void {
        // las estádisticas se guardan independientemente de que el usuario guarde en el historial.
        timer(100)
            .pipe(switchMap(() => this.saveOnStatics$()))
            .subscribe();
    }

    downloadPDF(): void {
        this.isDownloading = true;
        this.cd.detectChanges();

        // ponemos el setTimeout para que se pueda actualizar el boton
        setTimeout(() => {
            const pages = this.getPages();
            const pdfPages = pages.map((page) => ({ html: page.html }));

            this.pdfGenerationService
                .generatePDFFromPages(pdfPages, this.fileName)
                .then(() => {
                    this.isDownloading = false;
                    this.isFileDownloaded = true;
                    this.messagesService.info('Se abrirá el diálogo de descarga');
                    this.cd.detectChanges();
                })
                .catch(() => {
                    this.isDownloading = false;
                    this.cd.detectChanges();
                    this.messagesService.error('No se pudo generar el PDF');
                });
        }, 100);
    }

    exit(): void {
        this.navigationService.back({ targetPage: PageUrlName.availableTest });
    }

    saveAndExit(): void {
        this.saveOnHistory$().subscribe(() => this.exit());
    }

    private getPages(): PdfPageComponent[] {
        return this.steps.reduce<PdfPageComponent[]>((acc, { pages }) => (acc = acc.concat(pages)), []);
    }

    /**
     * guardar estadísticas
     */
    private saveOnStatics$(): Observable<number[]> {
        // poner todos los obsersables en un array, y ejecutar todos juntos uno por uno.
        const observables: Observable<number>[] = [];

        const activeStands = this.runEssayService.getActiveStands(this.preparationStep);

        // Estadística: Útilización de los puestos
        const standsUsed: Tags = activeStands.map(({ index }) => ({
            standIndex: index.toString()
        }));
        if (standsUsed.length > 0) {
            observables.push(this.staticsService.increment$(Metric.standUsed, standsUsed));
        }
        // Estadística:
        // - Modelos de medidores que más aprobaron
        // - Modelos de medidores que más desaprobaron
        const modelApproved: Tags = [] as Record<string, string>[];
        const modelFailed: Tags = [] as Record<string, string>[];
        this.executionSteps.forEach((step) => {
            const results = step.standResults;
            results.forEach(({ resultStatus, standIndex }) => {
                const activeStand = activeStands.find(({ index }) => index === standIndex);
                if (activeStand) {
                    const model = activeStand.stand.foreign.meter.model;
                    if (resultStatus === ResultStatus.Approved) {
                        modelApproved.push({ model });
                    }
                    if (resultStatus === ResultStatus.Failed) {
                        modelFailed.push({ model });
                    }
                }
            });
        });
        if (modelApproved.length > 0) {
            observables.push(this.staticsService.increment$(Metric.meterModelApproved, modelApproved));
        }
        if (modelFailed.length > 0) {
            observables.push(this.staticsService.increment$(Metric.meterModelFailed, modelFailed));
        }

        // TODO generar estadísticas sobre
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
    private saveOnHistory$(): Observable<{
        historyEssay: HistoryEssay;
        historyEssayRows: HistoryEssayStepStand[];
    }> {
        // bloquear la UI mientras está generando el historial.
        this.isSaving = true;
        this.blockUIService.setBlocked(true);
        this.cd.detectChanges();
        const savedTime = new Date().getTime();
        const historyEssay: Omit<HistoryEssay, 'id' | 'foreign'> = {
            run_raw: this.runEssay
        };
        let rows: Omit<HistoryEssayStepStand, 'id' | 'history_essay_id' | 'foreign'>[] = [];
        this.executionSteps.forEach((step) => {
            this.runEssayService.getActiveStands(this.preparationStep).forEach(({ index, stand }) => {
                let resultValue!: number;
                const result = step.standResults[index];
                if ('measuredPulses' in result) {
                    resultValue = result.measuredPulses as number;
                }
                if ('measuredError' in result) {
                    resultValue = result.measuredError as number;
                }
                if ('calculatedError' in result) {
                    resultValue = result.calculatedError as number;
                }
                const historyEssayStepStand: Omit<HistoryEssayStepStand, 'id' | 'history_essay_id' | 'foreign'> = {
                    saved_time: savedTime,
                    essay_name: this.runEssay.essayName,
                    step_name: step.form_control_raw.name,
                    meter_id: stand.foreign.meter.id,
                    serial_number: stand.serialNumber,
                    year_of_production: stand.yearOfProduction,
                    result_status_enum: step.standResults[index].resultStatus,
                    result_unit: StepResultUnit[step.step_id] as StepResultUnitEnum,
                    result_value: resultValue
                };
                rows = rows.concat(historyEssayStepStand);
            });
        });
        return this.historyEssayService.saveHistoryEssay$(historyEssay, rows).pipe(
            take(1),
            tap(() => {
                this.messagesService.success('Guardado correctamente');
            }),
            finalize(() => {
                this.isSaving = false;
                this.blockUIService.setBlocked(false);
                this.cd.detectChanges();
            }),
            catchError((err: Error) => {
                this.messagesService.error('No se pudo guardar el historial en la base de datos');
                return throwError(() => err);
            })
        );
    }
}
