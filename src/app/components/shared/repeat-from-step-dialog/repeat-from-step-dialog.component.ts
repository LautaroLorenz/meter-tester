import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { EssayStep } from '../../../models/business/interafces/essay-step.model';
import { Steps } from '../../../models/business/enums/steps.model';

@Component({
    selector: 'app-repeat-from-step-dialog',
    templateUrl: './repeat-from-step-dialog.component.html',
    styleUrls: ['./repeat-from-step-dialog.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RepeatFromStepDialogComponent {
    @Input() visible = false;
    @Input() availableSteps: EssayStep[] = [];
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
}