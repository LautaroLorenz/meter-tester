import { EssayTemplateStep } from '../../../../../../models/business/database/essay-template-step.model';
import { Steps } from '../../../../../../models/business/enums/steps.model';
import { MeterConstant } from '../../../../../../models/business/constants/meter-constant.model';
import { FormControl, FormGroup } from '@angular/forms';

export interface BootTestFormControlRaw {
  meterConstant: MeterConstant;
}

export interface BootTestStep extends EssayTemplateStep {
  step_id: Steps.BootTest;
  form_control_raw: BootTestFormControlRaw;
}

export type BootTestStepFormGroup = FormGroup<{
  id: FormControl<number>;
  name: FormControl<string>;
  order: FormControl<number>;
  essay_template_id: FormControl<number>;
  step_id: FormControl<number>;
  form_control_raw: FormGroup<{
    meterConstant: FormControl<MeterConstant>;
  }>;
  foreign: FormControl<Record<string, any>>;
}>;
