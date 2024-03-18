import { EssayTemplateStep } from '../database/essay-template-step.model';
import { PhotocellAdjustmentStatus } from '../enums/photocell-adjustment-status.model';
import { StepStatus } from '../enums/step-status.model';
import { StandResult } from './stand-result.model';

export interface EssayStep extends EssayTemplateStep {
  verifiedStatus: StepStatus;
  executedStatus: StepStatus;
  standResults: StandResult[];
  photocellAdjustmentStatus: PhotocellAdjustmentStatus;
}
