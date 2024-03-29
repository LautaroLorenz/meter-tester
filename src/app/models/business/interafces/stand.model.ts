import { Meter } from '../database/meter.model';

export interface Stand {
  name: string;
  isActive: boolean;
  meter: Meter;
  serialNumber: string;
  yearOfProduction: string;
}
