import { MajorSteps } from '../enums/major-steps.model';
import { StepStatus } from '../enums/step-status.model';
import { Steps } from '../enums/steps.model';
import { EssayStep } from '../interafces/essay-step.model';

export class MajorStepsDirector {
  static getStatus(essaySteps: EssayStep[]): Record<MajorSteps, StepStatus> {
    const isVerificationDone: boolean = essaySteps.every(
      ({ verifiedStatus, step_id }) =>
        verifiedStatus === StepStatus.Done && step_id !== Steps.Preparation
    );

    const isPreparationDone: boolean = essaySteps.every(
      ({ verifiedStatus, step_id }) =>
        verifiedStatus === StepStatus.Done && step_id === Steps.Preparation
    );

    const isExecutedDone: boolean = essaySteps.every(
      ({ executedStatus }) => executedStatus === StepStatus.Done
    );

    return {
      [MajorSteps.Verification]: this.getStepStatus(true, isVerificationDone),
      [MajorSteps.Preparation]: this.getStepStatus(
        isVerificationDone,
        isPreparationDone
      ),
      [MajorSteps.Execution]: this.getStepStatus(
        isPreparationDone,
        isExecutedDone
      ),
      [MajorSteps.Report]: this.getStepStatus(isExecutedDone, false),
    };
  }

  private static getStepStatus(
    isPreviousStepDone: boolean,
    isDone: boolean
  ): StepStatus {
    if (!isPreviousStepDone) {
      return StepStatus.Pending;
    }
    if (isDone) {
      return StepStatus.Done;
    }
    return StepStatus.Current;
  }
}
