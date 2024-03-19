import { PhotocellAdjustmentStatus } from '../enums/photocell-adjustment-status.model';
import { ResultStatus } from '../enums/result-status.model';
import { EssayStep } from '../interafces/essay-step.model';
import { PreparationStep } from '../interafces/steps/preparation-step.model';

export class ExecutionDirector {
  static getInitialStandResultStatus(
    preparatonStep: PreparationStep,
    standIndex: number
  ): ResultStatus {
    if (!preparatonStep.form_control_raw[standIndex]) {
      return ResultStatus.NotApply;
    }

    return preparatonStep.form_control_raw[standIndex].isActive
      ? ResultStatus.Pending
      : ResultStatus.NotApply;
  }

  static getInitialPhotocellAdjustmentStatus(
    essaySteps: EssayStep[],
    index: number
  ): PhotocellAdjustmentStatus {
    const currentStep = essaySteps[index];

    if ('meterConstant' in currentStep.form_control_raw === false) {
      return PhotocellAdjustmentStatus.NotApply;
    }

    const lastAjustmentMeterConstant: number | undefined =
      this.getLastAdjustmentMeterConstant(essaySteps, index);
    if (
      lastAjustmentMeterConstant !== undefined &&
      currentStep.form_control_raw.meterConstant === lastAjustmentMeterConstant
    ) {
      return PhotocellAdjustmentStatus.NotApply;
    }

    return PhotocellAdjustmentStatus.Pending;
  }

  private static getLastAdjustmentMeterConstant(
    essaySteps: EssayStep[],
    limitIndex: number
  ): number | undefined {
    for (let i = limitIndex - 1; i >= 0; i--) {
      const step = essaySteps[i];
      if ('meterConstant' in step.form_control_raw) {
        return step.form_control_raw.meterConstant as number;
      }
    }

    return undefined;
  }
}
