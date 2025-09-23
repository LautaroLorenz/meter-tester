import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { EssayStep } from '../../../models/business/interafces/essay-step.model';
import { Steps } from '../../../models/business/enums/steps.model';

@Component({
    selector: 'app-continue-to-step-dialog',
    templateUrl: './continue-to-step-dialog.component.html',
    styleUrls: ['./continue-to-step-dialog.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContinueToStepDialogComponent {
    @Input() visible = false;
    @Input() availableSteps: EssayStep[] = [];
    @Input() currentStepId!: number;
    @Output() visibleChange = new EventEmitter<boolean>();
    @Output() stepSelected = new EventEmitter<EssayStep>();

    readonly Steps = Steps;
    selectedStep: EssayStep | null = null;

    onCancel(): void {
        this.selectedStep = null;
        this.visibleChange.emit(false);
    }

    onConfirm(): void {
        if (this.selectedStep) {
            this.stepSelected.emit(this.selectedStep);
        }
    }

    getStepName(step: EssayStep): string {
        switch (step.step_id) {
            case Steps.VacuumTest:
                return 'Prueba de Vacío';
            case Steps.ContrastTest:
                return 'Prueba de Contraste';
            case Steps.BootTest:
                return 'Prueba de Arranque';
            case Steps.IntegrationTest:
                return 'Prueba de Integración';
            default:
                return `Paso ${step.id}`;
        }
    }

    getStepDescription(step: EssayStep): string {
        if (step.id === this.currentStepId) {
            return 'Continuar con el siguiente paso';
        } else if (step.id < this.currentStepId) {
            return 'Repetir desde este paso (se reiniciarán todos los pasos desde aquí)';
        }
        return '';
    }

    isCurrentStep(step: EssayStep): boolean {
        return step.id === this.currentStepId;
    }

    isPreviousStep(step: EssayStep): boolean {
        return step.id < this.currentStepId;
    }
}