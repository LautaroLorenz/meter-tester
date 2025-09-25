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

    get canConfirm(): boolean {
        return this.selectedSteps.length > 0 || this.includeCurrentStep;
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
            // Crear array con todos los pasos seleccionados
            const allSelectedSteps = [...this.selectedSteps];

            // Si el current step está seleccionado, agregarlo al array
            if (this.includeCurrentStep && this.currentStep) {
                allSelectedSteps.push(this.currentStep);
            }

            this.confirm.emit({
                selectedSteps: allSelectedSteps
            });
        }
        this.visibleChange.emit(false);
    }

    onStepSelectionChange(event: any): void {
        this.selectedSteps = event.value || [];
    }

    onCurrentStepToggle(): void {
        this.includeCurrentStep = !this.includeCurrentStep;
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
