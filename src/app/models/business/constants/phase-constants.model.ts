import { Phase } from '../interafces/phase.model';

export const EMPTY_PHASE: Phase = {
    isActive: true,
    voltage: 0,
    current: 0,
    anglePhi: 0,
    powerFactor: 0,
    powerFactorLetter: 'L'
};
