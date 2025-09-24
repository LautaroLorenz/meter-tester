import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { EssayStep } from '../../../models/business/interafces/essay-step.model';
import { ExecutionDirector } from '../../../models/business/class/execution-director.model';
import { RunEssayService } from '../../../services/run-essay.service';
import { StepStatus } from '../../../models/business/enums/step-status.model';
import { Observable, Subject, forkJoin, take, takeUntil, tap, switchMap, map } from 'rxjs';
import { PhotocellAdjustmentStatus } from '../../../models/business/enums/photocell-adjustment-status.model';
import { PreparationEssayStep } from '../../../models/business/interafces/steps/preparation-step.model';
import { FormatDatePipe } from '../../../pipes/core/fomat-date.pipe';
import { WakeLockService } from '../../../services/wake-lock.service';
import { SecondaryWindowService } from '../../../services/secondary-window.service';

@Component({
    selector: 'app-execution-major-step',
    templateUrl: './execution-major-step.component.html',
    styleUrls: ['./execution-major-step.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExecutionMajorStepComponent implements OnInit, OnDestroy {
    executionSteps: EssayStep[] | undefined;
    preparationStep: EssayStep | undefined;
    currentStep: EssayStep | undefined;

    readonly PhotocellAdjustmentStatus = PhotocellAdjustmentStatus;
    readonly onDestroy = new Subject<void>();
    private readonly PATTERN_WINDOW_URL = 'pattern-status-window';

    private readonly formatDate = inject(FormatDatePipe);

    constructor(
        private readonly runEssayService: RunEssayService,
        private readonly wakeLockService: WakeLockService,
        private readonly secondaryWindowService: SecondaryWindowService
    ) {}

    get executionSteps$(): Observable<EssayStep[]> {
        return this.runEssayService.executionSteps$.pipe(
            tap((executionSteps) => (this.executionSteps = executionSteps))
        );
    }

    get preparationStep$(): Observable<PreparationEssayStep> {
        return this.runEssayService.preparationStep$.pipe(
            tap((preparationStep) => (this.preparationStep = preparationStep))
        ) as Observable<PreparationEssayStep>;
    }

    get currentStep$(): Observable<EssayStep | undefined> {
        return this.runEssayService.currentStep$.pipe(tap((currentStep) => (this.currentStep = currentStep)));
    }

    ngOnInit(): void {
        forkJoin({
            executionSteps: this.executionSteps$.pipe(take(1)),
            preparationStep: this.preparationStep$.pipe(take(1))
        })
            .pipe(
                switchMap((result) => this.wakeLockService.activateWakeLock().pipe(map(() => result))),
                tap(({ executionSteps, preparationStep }) => this.initExecutionsProps(executionSteps, preparationStep))
            )
            .subscribe(() => this.start());

        this.observeExecutionSteps();
    }

    ngOnDestroy(): void {
        this.wakeLockService.deactivateWakeLock().pipe(take(1)).subscribe();
        // Cerrar la ventana secundaria patrón (si no esta abierta no pasa nada)
        void this.secondaryWindowService.closeWindowByUrl(this.PATTERN_WINDOW_URL);
        this.onDestroy.next();
        this.onDestroy.complete();
    }

    photocellAdjustmentDone(stepId: number): void {
        this.runEssayService
            .getEssayStep(stepId)
            .get('photocellAdjustmentStatus')
            ?.setValue(PhotocellAdjustmentStatus.Done);
    }

    private start(): void {
        if (!this.executionSteps?.length) {
            return;
        }

        this.runEssayService
            .getEssayStep(this.executionSteps[0].id)
            .get('executedStatus')
            ?.setValue(StepStatus.Current);
    }

    private initExecutionsProps(essaySteps: EssayStep[], preparationStep: PreparationEssayStep): void {
        essaySteps.forEach((essayStep, index) => {
            // estado de la ejecución
            this.runEssayService.getEssayStep(essayStep.id).get('executedStatus')?.setValue(StepStatus.Pending);

            // estado del ajuste de fotocélulas
            const photocellAdjustmentStatus = ExecutionDirector.getInitialPhotocellAdjustmentStatus(essaySteps, index);
            this.runEssayService
                .getEssayStep(essayStep.id)
                .get('photocellAdjustmentStatus')
                ?.setValue(photocellAdjustmentStatus);

            // estado del resultado de los stands activos
            essayStep.standResults.forEach((_, standIndex) => {
                const standResultStatus = ExecutionDirector.getInitialStandResultStatus(preparationStep, standIndex);

                this.runEssayService
                    .getStandResult(essayStep.id, standIndex)
                    .get('resultStatus')
                    ?.setValue(standResultStatus);
            });
        });
    }

    private observeExecutionSteps(): void {
        this.executionSteps$
            .pipe(
                takeUntil(this.onDestroy),
                tap((steps) => {
                    // si todos los steps se ejecutaron, avanzar al siguiente major step
                    if (this.isAllStepsDone(steps)) {
                        // FIXME no funciona en el modo skip de todos los steps
                        // this.runEssayService.runEssayForm.patchValue({
                        //   endDate: this.formatDate.transform(
                        //     new Date(),
                        //     FormatDateMode.fromClientToDatabase
                        //   ) as string,
                        // });
                        this.runEssayService.nextMajorStep();
                    }
                    // si un step paso a Executed Done, avanzar con la ejecución del próximo
                    if (this.isAnyCurrentStep(steps)) {
                        const nextExecutionStep = steps.find(
                            ({ executedStatus }) => executedStatus === StepStatus.Pending
                        );
                        if (!nextExecutionStep) {
                            this.runEssayService.nextMajorStep();
                            return;
                        }
                        this.runEssayService
                            .getEssayStep(nextExecutionStep.id)
                            .get('executedStatus')
                            ?.setValue(StepStatus.Current);
                    }
                })
            )
            .subscribe();
    }

    private isAllStepsDone(executionSteps: EssayStep[]): boolean {
        return executionSteps.every(
            ({ executedStatus }) => executedStatus === StepStatus.Done || executedStatus === StepStatus.Skipped
        );
    }

    private isAnyCurrentStep(executionSteps: EssayStep[]): boolean {
        return executionSteps.every(({ executedStatus }) => executedStatus !== StepStatus.Current);
    }
}
