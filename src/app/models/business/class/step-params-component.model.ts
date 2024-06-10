import { EssayTemplateStep } from '../database/essay-template-step.model';
import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export abstract class StepParamsComponent<T extends EssayTemplateStep> implements OnChanges {
    @Input() currentStep!: T;
    @Input() toggleable!: boolean;

    showCompleteName!: boolean;

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.currentStep) {
            this.showCompleteName = this.getShowCompleteName(changes.currentStep.currentValue as T);
        }
    }

    private getShowCompleteName(currentStep: T): boolean {
        return currentStep.foreign.step?.name !== currentStep.form_control_raw.name;
    }
}
