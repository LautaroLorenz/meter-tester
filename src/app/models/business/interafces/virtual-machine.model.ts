import {
  CommandRefreshType,
  VMDelayTypes,
  VMResponseTypes,
} from '../enums/virtual-machine-config.model';

export interface VirtualMachineConfig {
  responseType: VMResponseTypes;
  delayType: VMDelayTypes;
  fixedDelay: undefined | number;
  minDelay: number;
  maxDelay: number;
  commandRefreshType: CommandRefreshType;
}
