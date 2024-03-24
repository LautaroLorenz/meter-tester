import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
} from '@angular/core';
import { CBVariableTypes } from '../enums/command-variable-block-config.model';
import { Devices } from '../enums/devices.model';

@Component({
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export abstract class VMDeviceComponent {
  @Output() write = new EventEmitter<string>();

  readonly CBVariableTypes = CBVariableTypes;

  abstract readonly device: Devices;
}
