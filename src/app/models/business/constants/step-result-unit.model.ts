import { Steps } from '../enums/steps.model';

export interface StepResultUnit {
    value: number;
    unit: string;
}

export enum StepResultUnitEnum {
    percentage = '%',
    pulses = 'Impulsos'
}

export const StepResultUnit: Record<Steps, StepResultUnitEnum | undefined> = {
    [Steps.BootTest]: StepResultUnitEnum.pulses,
    [Steps.ContrastTest]: StepResultUnitEnum.percentage,
    [Steps.VacuumTest]: StepResultUnitEnum.pulses,
    [Steps.IntegrationTest]: StepResultUnitEnum.percentage,
    [Steps.Preparation]: undefined
};
