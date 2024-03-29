import { Meter } from '../database/meter.model';

export interface StandMeter extends Meter {
  label: string;
}

export interface Stand {
  name: string;
  isActive: boolean;
  meter: StandMeter;
  serialNumber: string;
  yearOfProduction: string;
}
