import { EssayTemplateStep } from '../../../../../models/business/database/essay-template-step.model';
import { Steps } from '../../../../../models/business/enums/steps.model';
import { MeterConstant } from '../../../../../models/business/constants/meter-constant.model';
import { Phase } from '../../../../../models/business/interafces/phase.model';

export interface ContrastTestFormControlRaw {
  meterConstant: MeterConstant;
  phaseL1: Phase;
  phaseL2: Phase;
  phaseL3: Phase;
  maxAllowedError: number;
  meterPulses: number;
}

export interface ContrastTestStep extends EssayTemplateStep {
  step_id: Steps.ContrastTest;
  form_control_raw: ContrastTestFormControlRaw;
}
