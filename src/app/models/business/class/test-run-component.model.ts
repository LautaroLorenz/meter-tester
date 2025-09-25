import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { RunEssayService } from '../../../services/run-essay.service';
import { PreparationStep } from '../interafces/steps/preparation-step.model';
import { EssayStep } from '../interafces/essay-step.model';
import { StepStatus } from '../enums/step-status.model';
import { ResultStatus } from '../enums/result-status.model';
import { EnumAsOptionPipe } from '../../../pipes/core/enum-as-option.pipe';
import { ActiveStand } from '../interafces/active-stand.model';
import { Subject } from 'rxjs/internal/Subject';
import { Observable, of } from 'rxjs';
import { BlockUIService } from '../../../services/block-ui.service';
import { DeviceService } from '../../../services/device.service';
import { ConfirmationService, PrimeIcons } from 'primeng/api';
import { ExecutionDirector } from './execution-director.model';

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

    splitButtonItems: Array<{ label: string; icon: string; command: () => void; disabled?: boolean }> = [];

    showStepSelectionDialog = false;
    previousSteps: EssayStep[] = [];

    protected readonly runEssayService = inject(RunEssayService);
    protected readonly cd = inject(ChangeDetectorRef);
    protected readonly EnumAsOptionPipe = inject(EnumAsOptionPipe);
    protected readonly blockUIService = inject(BlockUIService);
    protected readonly deviceService = inject(DeviceService);
    protected readonly confirmationService = inject(ConfirmationService);
    protected readonly onDestroy = new Subject<void>();

    abstract readonly skipEnabled: boolean;

    get allActiveStandsPassed(): boolean {
        return this.getActiveStands().every(({ index }) => {
            const result = this.runEssayService.getStandResult(this.currentStep.id, index).getRawValue();
            return result.resultStatus === ResultStatus.Approved;
        });
    }

    get hasAnyStandFailed(): boolean {
        return this.getActiveStands().some(({ index }) => {
            const result = this.runEssayService.getStandResult(this.currentStep.id, index).getRawValue();
            return result.resultStatus === ResultStatus.Failed;
        });
    }

    get continueButtonStyleClass(): string {
        if (!this.canContinue) {
            return 'p-button-secondary opacity-30';
        }
        if (this.allActiveStandsPassed) {
            return 'p-button-success';
        }
        if (this.hasAnyStandFailed) {
            return 'p-button-warning';
        }
        return '';
    }

    get hasPreviousStep(): boolean {
        const essaySteps = this.runEssayService.runEssayForm.getRawValue().essaySteps as EssayStep[];
        const executionSteps = essaySteps.filter((step) => 'executedStatus' in step);
        const currentStepIndex = executionSteps.findIndex((step) => step.id === this.currentStep.id);
        return currentStepIndex > 0;
    }

    ngOnInit(): void {
        this.runEssayService.canDeactivate = this.abort.bind(this);
        this.executionSkip();
        this.updateSplitButtonItems();
        this.onStepInit();
        this.restartResults(ResultStatus.Pending);
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

    retryPrevious(): void {
        this.openStepSelectionDialog();
    }

    onStepSelectionCancel(): void {
        this.showStepSelectionDialog = false;
        this.cd.detectChanges();
    }

    onStepSelectionConfirm(data: { selectedSteps: EssayStep[] }): void {
        this.onRetrySelectedSteps(data.selectedSteps);
        this.showStepSelectionDialog = false;
        this.cd.detectChanges();
    }

    onRetrySelectedSteps(selectedSteps: EssayStep[]): void {
        // Deshabilitar el avance automático durante el retry
        this.setAutoAdvanceEnabled(false);

        // Primero apagar el generador antes de hacer retry
        this.stopGenerator().subscribe(() => {
            this.executeRetryLogic(selectedSteps);

            // Rehabilitar el avance automático después del retry
            this.setAutoAdvanceEnabled(true);
        });
    }

    /**
     * Marca un step como Done sin avanzar automáticamente al siguiente
     * @param essayStep El step a marcar como Done
     */
    protected markStepAsDone(essayStep: EssayStep): void {
        this.runEssayService.getEssayStep(essayStep.id).get('executedStatus')?.setValue(StepStatus.Done);
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

    protected updateSplitButtonItems(): void {
        this.splitButtonItems = [
            {
                label: 'Reintentar paso',
                icon: 'pi pi-refresh',
                command: () => this.restart()
            },
            {
                label: 'Ir a paso anterior',
                icon: 'pi pi-step-backward',
                command: () => this.retryPrevious(),
                disabled: !this.hasPreviousStep
            }
        ];
    }

    protected stopGenerator(): Observable<void> {
        // Este método debe ser sobrescrito en los componentes específicos
        // para ejecutar la lógica de apagado del generador
        return of(void 0);
    }

    /**
     * Habilita o deshabilita el avance automático de steps
     * @param enabled true para habilitar, false para deshabilitar
     *
     * @example
     * // Deshabilitar avance automático para control manual
     * this.setAutoAdvanceEnabled(false);
     *
     * // Marcar step como Done sin avanzar automáticamente
     * this.markStepAsDone(this.currentStep);
     *
     * // Avanzar manualmente cuando sea necesario
     * this.advanceToNextStep();
     *
     * // Rehabilitar avance automático
     * this.setAutoAdvanceEnabled(true);
     */
    protected setAutoAdvanceEnabled(enabled: boolean): void {
        this.runEssayService.setAutoAdvanceEnabled(enabled);
    }

    /**
     * Avanza manualmente al siguiente step pendiente
     * @returns true si se pudo avanzar, false si no hay más steps pendientes
     *
     * @example
     * // Avanzar al siguiente step manualmente
     * const advanced = this.advanceToNextStep();
     * if (!advanced) {
     *     console.log('No hay más steps pendientes');
     * }
     */
    protected advanceToNextStep(): boolean {
        const essaySteps = this.runEssayService.runEssayForm.getRawValue().essaySteps as EssayStep[];
        const executionSteps = essaySteps.filter((step) => 'executedStatus' in step);

        const nextExecutionStep = executionSteps.find(({ executedStatus }) => executedStatus === StepStatus.Pending);

        if (!nextExecutionStep) {
            // No hay más steps pendientes, avanzar al siguiente major step
            this.runEssayService.nextMajorStep();
            return false;
        }

        // Marcar el siguiente step como Current
        this.runEssayService.getEssayStep(nextExecutionStep.id).get('executedStatus')?.setValue(StepStatus.Current);

        return true;
    }

    private executeRetryLogic(selectedSteps: EssayStep[]): void {
        // 1. Si el current step no está seleccionado, marcarlo como Done
        const isCurrentStepSelected = selectedSteps.some((step) => step.id === this.currentStep.id);
        if (!isCurrentStepSelected) {
            this.markStepAsDone(this.currentStep);
        }

        // 2. Para todos los pasos seleccionados: marcarlos como Pending y reiniciar estados
        selectedSteps.forEach((step) => {
            // Marcar como Pending
            this.runEssayService.getEssayStep(step.id).get('executedStatus')?.setValue(StepStatus.Pending);

            // Reiniciar estado de fotocélulas según ExecutionDirector logic
            this.resetPhotocellAdjustmentStatus(step);
        });

        // 3. Avanzar al siguiente step
        this.advanceToNextStep();
    }

    private resetPhotocellAdjustmentStatus(step: EssayStep): void {
        // Obtener todos los pasos de ejecución para calcular el estado inicial
        const essaySteps = this.runEssayService.runEssayForm.getRawValue().essaySteps as EssayStep[];
        const executionSteps = essaySteps.filter((s) => 'executedStatus' in s);
        const stepIndex = executionSteps.findIndex((s) => s.id === step.id);

        if (stepIndex !== -1) {
            const photocellAdjustmentStatus = ExecutionDirector.getInitialPhotocellAdjustmentStatus(
                executionSteps,
                stepIndex
            );
            this.runEssayService
                .getEssayStep(step.id)
                .get('photocellAdjustmentStatus')
                ?.setValue(photocellAdjustmentStatus);
        }
    }

    private openStepSelectionDialog(): void {
        const essaySteps = this.runEssayService.runEssayForm.getRawValue().essaySteps as EssayStep[];
        const executionSteps = essaySteps.filter((step) => 'executedStatus' in step);
        const currentStepIndex = executionSteps.findIndex((step) => step.id === this.currentStep.id);

        // Obtener todos los pasos anteriores al actual
        this.previousSteps = executionSteps.slice(0, currentStepIndex);
        this.showStepSelectionDialog = true;
        this.cd.detectChanges();
    }

    abstract onStepInit(): void;

    abstract abort(): Observable<boolean>;

    abstract isFailCondition(...args: any[]): boolean;

    abstract startTest(): void;

    abstract stopTest(): void;

    abstract restartResults(resultStatus: ResultStatus): void;

    abstract onRestart(): void;
}
