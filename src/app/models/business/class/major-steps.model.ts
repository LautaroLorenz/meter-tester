import { MajorSteps } from '../enums/major-steps.model';
import { StepStatus } from '../enums/step-status.model';
import { Steps } from '../enums/steps.model';
import { EssayStep } from '../interafces/essay-step.model';

export class MajorStepsDirector {
  static stepsByMajorStep(
    essaySteps: EssayStep[],
    majorStep: MajorSteps
  ): EssayStep[] {
    switch (majorStep) {
      case MajorSteps.Verification:
        return essaySteps.filter(
          (essayStep) =>
            'verifiedStatus' in essayStep &&
            essayStep.step_id !== Steps.Preparation
        );
      case MajorSteps.Preparation:
        return essaySteps.filter(
          (essayStep) =>
            'verifiedStatus' in essayStep &&
            essayStep.step_id === Steps.Preparation
        );
      case MajorSteps.Execution:
        return essaySteps.filter((essayStep) => 'executedStatus' in essayStep);
      case MajorSteps.Report:
        return essaySteps;
    }
  }

  static getMajorStepStatusMap(essaySteps: EssayStep[]): Record<MajorSteps, StepStatus> {
    const isVerificationDone: boolean = this.stepsByMajorStep(
      essaySteps,
      MajorSteps.Verification
    ).every(({ verifiedStatus }) => verifiedStatus === StepStatus.Done);

    const isPreparationDone: boolean = this.stepsByMajorStep(
      essaySteps,
      MajorSteps.Preparation
    ).every(({ verifiedStatus }) => verifiedStatus === StepStatus.Done);

    const isExecutedDone: boolean = this.stepsByMajorStep(
      essaySteps,
      MajorSteps.Execution
    ).every(({ executedStatus }) => executedStatus === StepStatus.Done);

    return {
      [MajorSteps.Verification]: this.getMajorStepStatus(
        true,
        isVerificationDone
      ),
      [MajorSteps.Preparation]: this.getMajorStepStatus(
        isVerificationDone,
        isPreparationDone
      ),
      [MajorSteps.Execution]: this.getMajorStepStatus(
        isPreparationDone,
        isExecutedDone
      ),
      [MajorSteps.Report]: this.getMajorStepStatus(isExecutedDone, false),
    };
  }

  private static getMajorStepStatus(
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
