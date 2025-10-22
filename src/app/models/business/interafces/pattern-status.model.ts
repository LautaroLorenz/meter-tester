import { Phase } from "./phase.model";

export interface PatternStatus {
    constant: number;
    multiplier: number;
    phaseL1: Phase;
    phaseL2: Phase;
    phaseL3: Phase;
}
