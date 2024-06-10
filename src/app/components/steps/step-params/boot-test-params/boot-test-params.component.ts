import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { StepParamsComponent } from '../../../../models/business/class/step-params-component.model';
import { BootTestEssayStep } from '../../../../models/business/interafces/steps/boot-test-step.model';

@Component({
    selector: 'app-boot-test-params',
    templateUrl: './boot-test-params.component.html',
    styleUrls: ['./boot-test-params.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BootTestParamsComponent extends StepParamsComponent<BootTestEssayStep> {
    @Input() showTexts!: boolean;
}
