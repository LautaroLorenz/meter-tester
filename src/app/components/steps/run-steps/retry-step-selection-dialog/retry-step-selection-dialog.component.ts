import {
    Component,
    EventEmitter,
    Input,
    Output,
    ChangeDetectionStrategy,
    OnChanges,
    SimpleChanges
} from '@angular/core';
import { EssayStep } from '../../../../models/business/interafces/essay-step.model';
import { RunEssayService } from '../../../../services/run-essay.service';

@Component({
    selector: 'app-retry-step-selection-dialog',
    templateUrl: './retry-step-selection-dialog.component.html',
    styleUrls: ['./retry-step-selection-dialog.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RetryStepSelectionDialogComponent implements OnChanges {
    @Input() visible = false;
    @Input() previousSteps: EssayStep[] = [];
    @Input() currentStep: EssayStep | null = null;

    @Output() visibleChange = new EventEmitter<boolean>();
    @Output() cancel = new EventEmitter<void>();
    @Output() confirm = new EventEmitter<{ selectedSteps: EssayStep[] }>();

    stepsWithDisplayName: Array<{ step: EssayStep; displayName: string; isCurrent: boolean }> = [];
    selectedSteps: EssayStep[] = [];
    includeCurrentStep = false;

    constructor(private runEssayService: RunEssayService) {}

    get canConfirm(): boolean {
        return this.selectedSteps.length > 0 || this.includeCurrentStep;
    }

    getCurrentStepDisplayName(): string {
        if (!this.currentStep) {
            return 'Paso actual no disponible';
        }

        // Obtener el número del paso actual basándose en su posición en todos los pasos
        const essaySteps = this.runEssayService.runEssayForm.getRawValue().essaySteps as EssayStep[];
        const executionSteps = essaySteps.filter((step) => 'executedStatus' in step);
        const currentStepIndex = executionSteps.findIndex((step) => step.id === this.currentStep?.id);
        const stepNumber = currentStepIndex + 1;

        const stepName = this.currentStep?.form_control_raw?.name as string;
        const displayName = stepName || 'Sin nombre';
        return `Paso ${stepNumber} (Actual): ${displayName}`;
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['previousSteps'] || changes['currentStep']) {
            this.generateDisplayNames();
        }
    }

    onDialogHide(): void {
        this.cancelDialog();
    }

    onCancelClick(): void {
        this.cancelDialog();
    }

    onConfirmClick(): void {
        if (this.selectedSteps.length > 0 || this.includeCurrentStep) {
            // Extraer solo los objetos EssayStep de los pasos seleccionados del listbox
            const finalSelectedSteps: EssayStep[] = this.selectedSteps.map((item: any) => item.step as EssayStep);

            // Si el current step checkbox está marcado, agregar el paso actual a la lista
            if (this.includeCurrentStep && this.currentStep) {
                // Asegurarse de que el currentStep no se duplique si ya fue seleccionado en el listbox
                if (!finalSelectedSteps.some((step) => step.id === this.currentStep?.id)) {
                    finalSelectedSteps.push(this.currentStep);
                }
            }

            this.confirm.emit({
                selectedSteps: finalSelectedSteps
            });
        }
        this.visibleChange.emit(false);
    }

    onStepSelectionChange(event: any): void {
        this.selectedSteps = event.value || [];
    }

    private cancelDialog(): void {
        this.selectedSteps = [];
        this.includeCurrentStep = false;
        this.visibleChange.emit(false);
        this.cancel.emit();
    }

    private generateDisplayNames(): void {
        // Solo mostrar los pasos anteriores, no el current
        this.stepsWithDisplayName = this.previousSteps.map((step, index) => ({
            step: step,
            displayName: this.getStepDisplayName(step, index + 1),
            isCurrent: false
        }));
    }

    private getStepDisplayName(step: EssayStep, stepNumber: number): string {
        const stepName = step.form_control_raw?.name as string;
        const displayName = stepName || 'Sin nombre';
        return `Paso ${stepNumber}: ${displayName}`;
    }
}
