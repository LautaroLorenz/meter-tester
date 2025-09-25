import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { EssayStep } from '../../../../models/business/interafces/essay-step.model';

@Component({
    selector: 'app-retry-step-selection-dialog',
    templateUrl: './retry-step-selection-dialog.component.html',
    styleUrls: ['./retry-step-selection-dialog.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RetryStepSelectionDialogComponent {
    @Input() visible = false;
    @Input() previousSteps: EssayStep[] = [];
    @Input() selectedPreviousStep: EssayStep | null = null;

    @Output() visibleChange = new EventEmitter<boolean>();
    @Output() selectedPreviousStepChange = new EventEmitter<EssayStep | null>();
    @Output() cancel = new EventEmitter<void>();
    @Output() confirm = new EventEmitter<EssayStep>();

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

    onStepSelectionChange(selectedStep: EssayStep | null): void {
        this.selectedPreviousStepChange.emit(selectedStep);
    }
}
