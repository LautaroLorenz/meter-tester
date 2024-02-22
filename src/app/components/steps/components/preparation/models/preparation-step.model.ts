import { EssayTemplateStep } from '../../../../../models/business/database/essay-template-step.model';
import { Steps } from '../../../../../models/business/enums/steps.model';
import { Stand } from '../../../../../models/business/interafces/stand.model';

export type PreparationFormControlRaw = Stand[];

export interface PreparationStep extends EssayTemplateStep {
  step_id: Steps.Preparation;
  form_control_raw: PreparationFormControlRaw;
}
