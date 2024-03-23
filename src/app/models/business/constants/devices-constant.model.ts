import { Devices } from '../enums/devices.model';

export const DeviceConstants: Record<Devices, string> = {
  [Devices.STW]: 'Software',
  [Devices.CAL]: 'Calculador',
  [Devices.GEN]: 'Generador',
  [Devices.PAT]: 'Patron',
};
