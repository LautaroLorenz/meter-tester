import { StepStatus } from "../enums/step-status.model";

export const StepStatusColorMap: Record<StepStatus, string> = {
    [StepStatus.Pending]: 'surface-300',
    [StepStatus.Current]: 'bg-blue-400',
    [StepStatus.Done]: 'bg-green-500',
  };