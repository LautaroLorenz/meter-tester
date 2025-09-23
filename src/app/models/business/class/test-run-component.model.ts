import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { RunEssayService } from '../../../services/run-essay.service';
import { PreparationStep } from '../interafces/steps/preparation-step.model';
import { EssayStep } from '../interafces/essay-step.model';
import { StepStatus } from '../enums/step-status.model';
import { ResultStatus } from '../enums/result-status.model';
import { EnumAsOptionPipe } from '../../../pipes/core/enum-as-option.pipe';
import { ActiveStand } from '../interafces/active-stand.model';
import { Subject } from 'rxjs/internal/Subject';
import { Observable, take, tap, map } from 'rxjs';
import { BlockUIService } from '../../../services/block-ui.service';
import { DeviceService } from '../../../services/device.service';
import { ConfirmationService, PrimeIcons } from 'primeng/api';
import { MajorSteps } from '../enums/major-steps.model';

@Component({
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export abstract class TestRunComponent<T extends EssayStep> implements OnInit, OnDestroy {
    @Input() currentStep!: T;
    @Input() preparationStep!: PreparationStep;

    tabIndex = 0;
    canExecute = false;
    canContinue = false;
    isExecuting = false;
    showRepeatFromDialog = false;
    showContinueToDialog = false;

    protected readonly runEssayService = inject(RunEssayService);
    protected readonly cd = inject(ChangeDetectorRef);
    protected readonly EnumAsOptionPipe = inject(EnumAsOptionPipe);
    protected readonly blockUIService = inject(BlockUIService);
    protected readonly deviceService = inject(DeviceService);
    protected readonly confirmationService = inject(ConfirmationService);
    protected readonly onDestroy = new Subject<void>();

    abstract readonly skipEnabled: boolean;

    ngOnInit(): void {
        this.runEssayService.canDeactivate = this.abort.bind(this);
        this.executionSkip();
        this.onStepInit();
    }

    ngOnDestroy(): void {
        this.runEssayService.canDeactivate = null;
        this.onDestroy.next();
        this.onDestroy.complete();
    }

    getActiveStands(): ActiveStand[] {
        return this.runEssayService.getActiveStands(this.preparationStep);
    }

    stepExecutionDone(essayStep: EssayStep): void {
        this.runEssayService.getEssayStep(essayStep.id).get('executedStatus')?.setValue(StepStatus.Done);
    }

    stepExecutionSkipped(essayStep: EssayStep): void {
        this.runEssayService.getEssayStep(essayStep.id).get('executedStatus')?.setValue(StepStatus.Skipped);
    }

    stepExecutionSkip(essayStep: EssayStep): void {
        this.confirmationService.confirm({
            message: 'Al omitir la ejecución del paso, el mismo no se mostrará en el reporte.',
            header: 'Confirmar omitir ejecución de este paso',
            icon: PrimeIcons.EXCLAMATION_TRIANGLE,
            defaultFocus: 'reject',
            acceptButtonStyleClass: 'p-button-warning',
            accept: () => {
                this.abort().subscribe(() => this.stepExecutionSkipped(essayStep));
            }
        });
    }

    /**
     * Todos los stands que no fallarón, aprueban
     */
    setApprovedStatus(): void {
        this.getActiveStands().forEach(({ index }) => {
            const stand = this.runEssayService.getStandResult(this.currentStep.id, index);
            const { resultStatus } = stand.getRawValue();
            if (resultStatus !== ResultStatus.Failed) {
                stand.patchValue({ resultStatus: ResultStatus.Approved });
            }
        });
    }

    getCanContinue(): boolean {
        return this.getActiveStands().every(({ index }) => {
            const { resultStatus } = this.runEssayService.getStandResult(this.currentStep.id, index).getRawValue();

            return resultStatus === ResultStatus.Failed || resultStatus === ResultStatus.Approved;
        });
    }

    restart(): void {
        this.tabIndex = 0;
        this.canExecute = false;
        this.restartResults(ResultStatus.Pending);
        this.canContinue = this.getCanContinue();
        this.onRestart();
    }

    protected isAllStandsFailed(): boolean {
        return this.getActiveStands().every(
            ({ index }) =>
                this.runEssayService.getStandResult(this.currentStep.id, index).getRawValue().resultStatus ===
                ResultStatus.Failed
        );
    }

    protected isAllStandsWithResultLocked(): boolean {
        return this.getActiveStands().every(
            ({ index }) =>
                this.runEssayService.getStandResult(this.currentStep.id, index).getRawValue().resultStatus ===
                ResultStatus.Locked
        );
    }

    protected checkFailedStatus(): void {
        this.getActiveStands().forEach(({ index }) => {
            const stand = this.runEssayService.getStandResult(this.currentStep.id, index);
            const result = stand.getRawValue();
            if (this.isFailCondition(result)) {
                stand.patchValue({ resultStatus: ResultStatus.Failed });
            }
        });
        this.cd.detectChanges();
    }

    protected skip(): void {
        if (!this.skipEnabled) {
            return;
        }
        this.stepExecutionDone(this.currentStep);
    }

    protected executionSkip(): void {
        if (!this.skipEnabled) {
            return;
        }
        this.startTest();
    }

    /**
     * Obtiene los pasos de ejecución disponibles para repetir desde
     */
    getAvailableStepsToRepeatFrom(): Observable<EssayStep[]> {
        return this.runEssayService.executionSteps$.pipe(
            map((executionSteps: EssayStep[]) => executionSteps.filter((step: EssayStep) => step.id <= this.currentStep.id))
        );
    }

    /**
     * Muestra el diálogo para seleccionar desde qué paso repetir
     */
    openRepeatFromDialog(): void {
        this.showRepeatFromDialog = true;
        this.cd.detectChanges();
    }

    /**
     * Repite la ejecución desde el paso seleccionado
     */
    repeatFromStep(selectedStep: EssayStep): void {
        this.showRepeatFromDialog = false;
        this.abort().subscribe(() => {
            this.resetStepsFrom(selectedStep.id);
        });
    }

    /**
     * Resetea todos los pasos desde el stepId seleccionado
     */
    private resetStepsFrom(fromStepId: number): void {
        this.runEssayService.executionSteps$.pipe(
            take(1),
            tap((executionSteps: EssayStep[]) => {
                executionSteps.forEach((step: EssayStep) => {
                    if (step.id >= fromStepId) {
                        // Resetear el estado del paso
                        this.runEssayService
                            .getEssayStep(step.id)
                            .get('executedStatus')
                            ?.setValue(StepStatus.Pending);
                        
                        // Resetear los resultados específicos del test
                        this.resetTestSpecificResults(step.id);
                        
                        // Resetear los resultados de los stands
                        this.getActiveStands().forEach(({ index }) => {
                            const standResult = this.runEssayService.getStandResult(step.id, index);
                            standResult.patchValue({
                                resultStatus: ResultStatus.Pending
                            });
                        });
                    }
                });
                
                // Marcar el paso seleccionado como actual
                this.runEssayService
                    .getEssayStep(fromStepId)
                    .get('executedStatus')
                    ?.setValue(StepStatus.Current);
            })
        ).subscribe();
    }

    /**
     * Resetea los resultados específicos del tipo de test
     */
    protected resetTestSpecificResults(stepId: number): void {
        // Este método será sobrescrito por cada componente específico
        // para limpiar los resultados específicos de su tipo de test
    }

    /**
     * Muestra el diálogo para seleccionar a qué paso continuar
     */
    openContinueToDialog(): void {
        this.showContinueToDialog = true;
        this.cd.detectChanges();
    }

    /**
     * Continúa a un paso específico (puede ser anterior o siguiente)
     */
    continueToStep(selectedStep: EssayStep): void {
        this.showContinueToDialog = false;
        if (selectedStep.id < this.currentStep.id) {
            // Si es un paso anterior, usar la funcionalidad de repetir
            this.repeatFromStep(selectedStep);
        } else if (selectedStep.id === this.currentStep.id) {
            // Si es el paso actual, simplemente continuar
            this.stepExecutionDone(this.currentStep);
        }
        // Si es un paso posterior, no hacer nada (no se puede saltar hacia adelante)
    }

    /**
     * Obtiene los pasos disponibles para continuar (anteriores al actual)
     */
    getAvailableStepsToContinueTo(): Observable<EssayStep[]> {
        return this.runEssayService.executionSteps$.pipe(
            map((executionSteps: EssayStep[]) => executionSteps.filter((step: EssayStep) => step.id <= this.currentStep.id))
        );
    }

    abstract onStepInit(): void;

    abstract abort(): Observable<boolean>;

    abstract isFailCondition(...args: any[]): boolean;

    abstract startTest(): void;

    abstract stopTest(): void;

    abstract restartResults(resultStatus: ResultStatus): void;

    abstract onRestart(): void;
}
