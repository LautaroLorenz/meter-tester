export interface Phase {
    isActive: boolean;
    voltage: number;
    current: number;
    anglePhi: number;
    powerFactor: number;
    powerFactorLetter: string;
}
