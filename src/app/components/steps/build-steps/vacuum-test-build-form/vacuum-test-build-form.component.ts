import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { StepBuildFormComponent } from '../../../../models/business/class/step-build-form-component.model';
import { VacuumTestFormBuilder, VacuumTestStep } from '../../../../models/business/interafces/steps/vacuum-step.model';
import { MeterConstants } from '../../../../models/business/constants/meter-constant.model';
import { AbstractFormGroup } from '../../../../models/core/abstract-form-group.model';
import { copyPhase } from '../../../../models/business/helper/copy-phase.helper';

@Component({
    selector: 'app-vacuum-test-build-form',
    templateUrl: './vacuum-test-build-form.component.html',
    styleUrls: ['./vacuum-test-build-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class VacuumTestBuildFormComponent extends StepBuildFormComponent<VacuumTestStep> {
    readonly MeterConstants = MeterConstants;
    readonly copyPhase = copyPhase;

    override buildForm(fb: FormBuilder): AbstractFormGroup<VacuumTestStep> {
        return new VacuumTestFormBuilder().build(fb).form as AbstractFormGroup<VacuumTestStep>;
    }

    override buildVerificationForm(fb: FormBuilder): AbstractFormGroup<VacuumTestStep> {
        return new VacuumTestFormBuilder().build(fb).withVerificationProps().form as AbstractFormGroup<VacuumTestStep>;
    }
}
