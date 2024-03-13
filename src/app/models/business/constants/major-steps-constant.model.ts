import { MajorSteps } from '../enums/major-steps.model';

export const MajorStepsMap: Record<MajorSteps, string> = {
  [MajorSteps.Verification]: 'Verificación',
  [MajorSteps.Execution]: 'Ejecución',
  [MajorSteps.Preparation]: 'Preparación',
  [MajorSteps.Report]: 'Reporte',
};
