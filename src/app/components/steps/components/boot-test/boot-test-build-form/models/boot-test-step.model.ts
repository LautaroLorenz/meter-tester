import { FormControl } from '@angular/forms';
import { EssayTemplateStep } from '../../../../../../models/business/database/essay-template-step.model';
import { Steps } from '../../../../../../models/business/enums/steps.model';

export interface BootTestFormControlRaw {
  // TODO
}

export interface BootTestStep extends EssayTemplateStep {
  step_id: Steps.BootTest;
  form_control_raw: BootTestFormControlRaw;
}

export type BootTestStepForm = {
  [Property in keyof BootTestStep]: FormControl<
    BootTestStep[Property] | undefined
  >;
};
