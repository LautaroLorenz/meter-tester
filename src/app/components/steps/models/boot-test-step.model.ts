import { EssayTemplateStep } from '../../../models/business/database/essay-template-step.model';
import { Steps } from '../../../models/business/enums/steps.model';

export interface BootTestFormControlRaw {
    // TODO
}

export interface BootTestStep extends EssayTemplateStep {
  step_id: Steps.BootTest;
  form_control_raw: BootTestFormControlRaw;
}
