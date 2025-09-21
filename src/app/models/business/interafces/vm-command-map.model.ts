import { Devices } from '../enums/devices.model';

export interface VMCommandMap {
    device: Devices;
    deviceName: string;
    startPattern: string;
    automaticResponse: string;
}
