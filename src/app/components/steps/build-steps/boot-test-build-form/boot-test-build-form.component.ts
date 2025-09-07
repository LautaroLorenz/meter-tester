import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { BootTestFormBuilder, BootTestStep } from '../../../../models/business/interafces/steps/boot-test-step.model';
import { AbstractFormGroup } from '../../../../models/core/abstract-form-group.model';
import { StepBuildFormComponent } from '../../../../models/business/class/step-build-form-component.model';
import { MeterConstants } from '../../../../models/business/constants/meter-constant.model';
import { copyPhase } from '../../../../models/business/helper/copy-phase.helper';

@Component({
    selector: 'app-boot-test-build-form',
    templateUrl: './boot-test-build-form.component.html',
    styleUrls: ['./boot-test-build-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BootTestBuildFormComponent extends StepBuildFormComponent<BootTestStep> {
    readonly MeterConstants = MeterConstants;
    readonly copyPhase = copyPhase;

    override buildForm(fb: FormBuilder): AbstractFormGroup<BootTestStep> {
        return new BootTestFormBuilder().build(fb).form as AbstractFormGroup<BootTestStep>;
    }

    override buildVerificationForm(fb: FormBuilder): AbstractFormGroup<BootTestStep> {
        return new BootTestFormBuilder().build(fb).withVerificationProps().form as AbstractFormGroup<BootTestStep>;
    }
}
