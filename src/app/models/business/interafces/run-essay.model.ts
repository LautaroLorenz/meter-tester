import { AbstractFormGroup } from '../../core/abstract-form-group.model';
import { EssayStep } from './essay-step.model';

export interface RunEssay {
  startDate: string;
  endDate: string;
  essayName: string;
  essayTemplateId: number;
  essaySteps: EssayStep[];
}

export type RunEssayForm = AbstractFormGroup<RunEssay>;
