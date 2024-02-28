import { EssayTemplateStep } from '../database/essay-template-step.model';
import { ExecutedStatus } from '../enums/executed-status.model';
import { VerifiedStatus } from '../enums/verified-status.model';
import { StandResult } from './stand-result.model';

export interface EssayStep extends EssayTemplateStep {
  verifiedStatus: VerifiedStatus;
  executedStatus?: ExecutedStatus;
  standResults?: StandResult[];
}
