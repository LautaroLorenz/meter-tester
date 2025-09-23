import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { StepParamsComponent } from '../../../../models/business/class/step-params-component.model';
import { IntegrationTestEssayStep } from '../../../../models/business/interafces/steps/integration-test-step.model';
import { MeterConstantEnum } from '../../../../models/business/constants/meter-constant.model';

@Component({
    selector: 'app-integration-test-params',
    templateUrl: './integration-test-params.component.html',
    styleUrls: ['./integration-test-params.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class IntegrationTestParamsComponent extends StepParamsComponent<IntegrationTestEssayStep> {
    @Input() showTexts!: boolean;

    readonly MeterConstantEnum = MeterConstantEnum;
}
