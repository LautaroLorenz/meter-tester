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

  static checkMajorStepStatus(
    steps: EssayStep[] | EssayStep,
    status: StepStatus,
    prop: keyof EssayStep
  ): boolean {
    if (Array.isArray(steps)) {
      return steps.every((step) => step[prop] === status);
    }

    return steps[prop] === status;
  }

  static getMajorStepStatusMap(
    essaySteps: EssayStep[]
  ): Record<MajorSteps, StepStatus> {
    if (!essaySteps || essaySteps.length === 0) {
      return {
        [MajorSteps.Verification]: StepStatus.Pending,
        [MajorSteps.Preparation]: StepStatus.Pending,
        [MajorSteps.Execution]: StepStatus.Pending,
        [MajorSteps.Report]: StepStatus.Pending,
      };
    }

    const verificationSteps = this.stepsByMajorStep(
      essaySteps,
      MajorSteps.Verification
    );

    const preparationSteps = this.stepsByMajorStep(
      essaySteps,
      MajorSteps.Preparation
    );

    const executionSteps = this.stepsByMajorStep(
      essaySteps,
      MajorSteps.Preparation
    );

    const isVerificationDone: boolean = this.checkMajorStepStatus(
      verificationSteps,
      StepStatus.Done,
      'verifiedStatus'
    );

    const isPreparationDone: boolean = this.checkMajorStepStatus(
      preparationSteps,
      StepStatus.Done,
      'verifiedStatus'
    );

    const isExecutedDone: boolean = this.checkMajorStepStatus(
      executionSteps,
      StepStatus.Done,
      'executedStatus'
    );

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
