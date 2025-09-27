import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import {
    IntegrationTestFormBuilder,
    IntegrationTestStep
} from '../../../../models/business/interafces/steps/integration-test-step.model';
import { AbstractFormGroup } from '../../../../models/core/abstract-form-group.model';
import { StepBuildFormComponent } from '../../../../models/business/class/step-build-form-component.model';
import { MeterConstants } from '../../../../models/business/constants/meter-constant.model';
import { copyPhase } from '../../../../models/business/helper/copy-phase.helper';

@Component({
    selector: 'app-integration-test-build-form',
    templateUrl: './integration-test-build-form.component.html',
    styleUrls: ['./integration-test-build-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class IntegrationTestBuildFormComponent extends StepBuildFormComponent<IntegrationTestStep> {
    readonly MeterConstants = MeterConstants;
    readonly copyPhase = copyPhase;

    override buildForm(fb: FormBuilder): AbstractFormGroup<IntegrationTestStep> {
        return new IntegrationTestFormBuilder().build(fb).form as AbstractFormGroup<IntegrationTestStep>;
    }

    override buildVerificationForm(fb: FormBuilder): AbstractFormGroup<IntegrationTestStep> {
        return new IntegrationTestFormBuilder().build(fb).withVerificationProps()
            .form as AbstractFormGroup<IntegrationTestStep>;
    }
}
