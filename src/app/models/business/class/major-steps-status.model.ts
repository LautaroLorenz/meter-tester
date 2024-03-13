import { MajorSteps } from '../enums/major-steps.model';
import { StepStatus } from '../enums/step-status.model';
import { EssayStep } from '../interafces/essay-step.model';

export class MajorStepsStatus {
  static get(essaySteps: EssayStep[]): Record<MajorSteps, StepStatus> {
    return {
      [MajorSteps.Verification]: StepStatus.Current,
      [MajorSteps.Preparation]: StepStatus.Pending,
      [MajorSteps.Execution]: StepStatus.Pending,
      [MajorSteps.Report]: StepStatus.Pending,
    };
  }
}
