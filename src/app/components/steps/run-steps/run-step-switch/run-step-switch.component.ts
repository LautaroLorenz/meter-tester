import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Input,
    OnChanges,
    SimpleChanges,
    inject
} from '@angular/core';
import { EssayStep } from '../../../../models/business/interafces/essay-step.model';
import { Steps } from '../../../../models/business/enums/steps.model';

@Component({
    selector: 'app-run-step-switch',
    templateUrl: './run-step-switch.component.html',
    styleUrls: ['./run-step-switch.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RunStepSwitchComponent implements OnChanges {
    @Input() currentStepId!: number;
    @Input() currentStep!: EssayStep;
    @Input() preparationStep!: EssayStep;

    readonly Steps = Steps;
    readonly cd = inject(ChangeDetectorRef);

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.currentStepId) {
            setTimeout(() => this.cd.detectChanges());
        }
    }
}
