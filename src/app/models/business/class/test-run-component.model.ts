import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Input,
    OnDestroy,
    OnInit,
    inject,
    ViewChild
} from '@angular/core';
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
import { RetryMode } from '../enums/retry-mode.enum';
import { ExecutionMajorStepComponent } from '../../../components/major-steps/execution-major-step/execution-major-step.component';

@Component({
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export abstract class TestRunComponent<T extends EssayStep> implements OnInit, OnDestroy {
    @Input() currentStep!: T;
    @Input() preparationStep!: PreparationStep;

    @ViewChild(ExecutionMajorStepComponent) executionMajorStepComponent?: ExecutionMajorStepComponent;

    tabIndex = 0;
    canExecute = false;
    canContinue = false;
    isExecuting = false;

    splitButtonItems: Array<{ label: string; icon: string; command: () => void; disabled?: boolean }> = [];

    showStepSelectionDialog = false;
    previousSteps: EssayStep[] = [];
    selectedPreviousStep: EssayStep | null = null;

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
        this.selectedPreviousStep = null;
        this.cd.detectChanges();
    }

    onStepSelectionConfirm(data: { step: EssayStep; retryMode: RetryMode }): void {
        this.onRetryPreviousStep(data.step, data.retryMode);
        this.showStepSelectionDialog = false;
        this.selectedPreviousStep = null;
        this.cd.detectChanges();
    }

    onRetryPreviousStep(selectedStep: EssayStep, retryMode: RetryMode = RetryMode.FROM_STEP): void {
        // Deshabilitar el avance automático durante el retry
        this.setAutoAdvanceEnabled(false);

        // Primero apagar el generador antes de hacer retry
        this.stopGenerator().subscribe(() => {
            this.executeRetryLogic(selectedStep, retryMode);

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
        this.executionMajorStepComponent?.setAutoAdvanceEnabled(enabled);
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
        return this.executionMajorStepComponent?.advanceToNextStep() ?? false;
    }

    private executeRetryLogic(selectedStep: EssayStep, retryMode: RetryMode): void {
        // Obtener todos los pasos de ejecución
        const essaySteps = this.runEssayService.runEssayForm.getRawValue().essaySteps as EssayStep[];
        const executionSteps = essaySteps.filter((step) => 'executedStatus' in step);

        // Encontrar el índice del paso seleccionado
        const selectedStepIndex = executionSteps.findIndex((step) => step.id === selectedStep.id);

        if (selectedStepIndex === -1) {
            return;
        }

        if (retryMode === RetryMode.FROM_STEP) {
            // Modo: Desde el paso seleccionado y todos los posteriores
            for (let i = selectedStepIndex; i < executionSteps.length; i++) {
                const step = executionSteps[i];
                this.runEssayService.getEssayStep(step.id).get('executedStatus')?.setValue(StepStatus.Pending);

                // Recalcular el estado de fotocélulas para este paso
                const photocellAdjustmentStatus = ExecutionDirector.getInitialPhotocellAdjustmentStatus(
                    executionSteps,
                    i
                );
                this.runEssayService
                    .getEssayStep(step.id)
                    .get('photocellAdjustmentStatus')
                    ?.setValue(photocellAdjustmentStatus);
            }
        } else {
            // Modo: Solo el paso seleccionado y el actual
            // Configurar el paso seleccionado como Pending primero
            this.runEssayService.getEssayStep(selectedStep.id).get('executedStatus')?.setValue(StepStatus.Pending);

            // Recalcular el estado de fotocélulas para el paso seleccionado
            const photocellAdjustmentStatus = ExecutionDirector.getInitialPhotocellAdjustmentStatus(
                executionSteps,
                selectedStepIndex
            );
            this.runEssayService
                .getEssayStep(selectedStep.id)
                .get('photocellAdjustmentStatus')
                ?.setValue(photocellAdjustmentStatus);
        }

        // Marcar el paso seleccionado como Current
        this.runEssayService.getEssayStep(selectedStep.id).get('executedStatus')?.setValue(StepStatus.Current);

        // Reiniciar los resultados de los stands para el paso seleccionado
        this.restartResults(ResultStatus.Pending);

        // Al final, marcar el paso actual como Pending (si existe y es diferente al seleccionado)
        const currentStep = executionSteps.find(
            (step) => step.executedStatus === StepStatus.Current && step.id !== selectedStep.id
        );
        if (currentStep) {
            this.runEssayService.getEssayStep(currentStep.id).get('executedStatus')?.setValue(StepStatus.Pending);

            // Recalcular el estado de fotocélulas para el paso actual
            const currentStepIndex = executionSteps.findIndex((step) => step.id === currentStep.id);
            const currentPhotocellAdjustmentStatus = ExecutionDirector.getInitialPhotocellAdjustmentStatus(
                executionSteps,
                currentStepIndex
            );
            this.runEssayService
                .getEssayStep(currentStep.id)
                .get('photocellAdjustmentStatus')
                ?.setValue(currentPhotocellAdjustmentStatus);
        }

        // Forzar la detección de cambios para actualizar la UI
        this.cd.detectChanges();
    }

    private openStepSelectionDialog(): void {
        const essaySteps = this.runEssayService.runEssayForm.getRawValue().essaySteps as EssayStep[];
        const executionSteps = essaySteps.filter((step) => 'executedStatus' in step);
        const currentStepIndex = executionSteps.findIndex((step) => step.id === this.currentStep.id);

        // Obtener todos los pasos anteriores al actual
        this.previousSteps = executionSteps.slice(0, currentStepIndex);
        this.selectedPreviousStep = null;
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
