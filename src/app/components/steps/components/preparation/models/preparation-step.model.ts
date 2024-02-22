import { EssayTemplateStep } from '../../../../../models/business/database/essay-template-step.model';
import { Steps } from '../../../../../models/business/enums/steps.model';

// export interface PreparationFormControlRaw {
// TODO
// }

export interface PreparationStep extends EssayTemplateStep {
  step_id: Steps.Preparation;
  // form_control_raw: PreparationFormControlRaw;
}
