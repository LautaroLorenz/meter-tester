import { EssayTemplateStep } from '../../../../models/business/database/essay-template-step.model';
import { Steps } from '../../../../models/business/enums/steps.model';
import { MeterConstant } from '../../../../models/business/constants/meter-constant.model';
import { Phase } from '../../../../models/business/interafces/phase.model';

export interface VacuumTestFormControlRaw {
  name: string;
  meterConstant: MeterConstant;
  phaseL1: Pick<Phase, 'voltage'>;
  phaseL2: Pick<Phase, 'voltage'>;
  phaseL3: Pick<Phase, 'voltage'>;
  maxAllowedPulses: number;
  durationSeconds: number;
}

export interface VacuumTestStep extends EssayTemplateStep {
  step_id: Steps.VacuumTest;
  form_control_raw: VacuumTestFormControlRaw;
}
