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
    @Input() selectedPreviousStep: EssayStep | null = null;

    @Output() visibleChange = new EventEmitter<boolean>();
    @Output() selectedPreviousStepChange = new EventEmitter<EssayStep | null>();
    @Output() cancel = new EventEmitter<void>();
    @Output() confirm = new EventEmitter<EssayStep>();

    previousStepsWithDisplayName: Array<{ step: EssayStep; displayName: string }> = [];

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['previousSteps']) {
            this.generateDisplayNames();
        }
    }

    onDialogHide(): void {
        this.visibleChange.emit(false);
        this.selectedPreviousStepChange.emit(null);
        this.cancel.emit();
    }

    onCancelClick(): void {
        this.visibleChange.emit(false);
        this.selectedPreviousStepChange.emit(null);
        this.cancel.emit();
    }

    onConfirmClick(): void {
        if (this.selectedPreviousStep) {
            this.confirm.emit(this.selectedPreviousStep);
        }
        this.visibleChange.emit(false);
        this.selectedPreviousStepChange.emit(null);
    }

    onStepSelectionChange(selectedItem: { step: EssayStep; displayName: string } | null): void {
        const selectedStep = selectedItem ? selectedItem.step : null;
        this.selectedPreviousStepChange.emit(selectedStep);
    }

    private generateDisplayNames(): void {
        this.previousStepsWithDisplayName = this.previousSteps.map((step, index) => ({
            step: step,
            displayName: this.getStepDisplayName(step, index + 1)
        }));
    }

    private getStepDisplayName(step: EssayStep, stepNumber: number): string {
        const stepName = step.form_control_raw?.name as string;
        const displayName = stepName || 'Sin nombre';
        return `Paso ${stepNumber}: ${displayName}`;
    }
}
