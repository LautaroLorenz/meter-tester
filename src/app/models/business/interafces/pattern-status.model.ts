import { Phase } from './phase.model';

export interface PatternStatus {
  constant: number;
  phaseL1: Phase;
  phaseL2: Phase;
  phaseL3: Phase;
}
