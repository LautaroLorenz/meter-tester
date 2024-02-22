import { EssayTemplateStep } from '../../../../../../models/business/database/essay-template-step.model';
import { Steps } from '../../../../../../models/business/enums/steps.model';
import { MeterConstant } from '../../../../../../models/business/constants/meter-constant.model';
import { Phase } from '../../../../../../models/business/forms/phase-form.model';

export interface BootTestFormControlRaw {
  meterConstant: MeterConstant;
  phaseL1: Phase;
  phaseL2: Phase;
  phaseL3: Phase;
  allowedPulses: number;
  minDurationSeconds: number;
  maxDurationSeconds: number;
}

export interface BootTestStep extends EssayTemplateStep {
  step_id: Steps.BootTest;
  form_control_raw: BootTestFormControlRaw;
}
