import { CommandsEnum, Devices } from "../enums/devices.model";

export interface VMCommandMap {
    device: Devices,
    commandRegex: string;
    commandResponse: CommandsEnum;
}
