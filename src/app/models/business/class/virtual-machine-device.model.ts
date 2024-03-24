import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { CBVariableTypes } from '../enums/command-variable-block-config.model';
import { CommandsEnum, Devices } from '../enums/devices.model';
import { CommandLineComponent } from '../../../components/virtual-machine/command-line/command-line.component';

@Component({
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export abstract class VMDeviceComponent {
  @Output() write = new EventEmitter<string>();
  @ViewChildren(CommandLineComponent)
  commandLines!: QueryList<CommandLineComponent>;

  readonly CBVariableTypes = CBVariableTypes;

  abstract readonly device: Devices;

  abstract getCommandByName(name: CommandsEnum): string | undefined;
}
