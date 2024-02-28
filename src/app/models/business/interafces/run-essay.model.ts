import { AbstractFormGroup } from '../../core/abstract-form-group.model';
import { EssayTemplateStep } from '../database/essay-template-step.model';
import { EssayExecutedStep } from './essay-executed-step.model';
import { EssayVerifiedStep } from './essay-verified-step.model';

export interface RunEssay {
  startDate: string;
  endDate: string;
  essayName: string;
  essayTemplateId: number;
  essayTemplateSteps: EssayTemplateStep[];
  essayVerifiedSteps: EssayVerifiedStep[];
  essayExecutedSteps: EssayExecutedStep[];
}

export type RunEssayForm = AbstractFormGroup<RunEssay>;
