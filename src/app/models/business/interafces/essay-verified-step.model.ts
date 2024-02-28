import { EssayTemplateStep } from '../database/essay-template-step.model';
import { VerifiedStatus } from '../enums/verified-status.model';

export interface EssayVerifiedStep extends EssayTemplateStep {
  verifiedStatus: VerifiedStatus;
}
