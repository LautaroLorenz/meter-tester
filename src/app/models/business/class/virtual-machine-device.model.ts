import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Output,
  inject,
} from '@angular/core';
import { Devices } from '../enums/devices.model';
import { CommandLine } from '../interafces/command-line.model';
import { CommandBlockTypes } from '../enums/command-block-types.model';
import { CommandLineDirector } from './command-line-director.model';

@Component({
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export abstract class VMDeviceComponent {
  @Output() write = new EventEmitter<string>();

  readonly CommandBlockTypes = CommandBlockTypes;

  private readonly cd = inject(ChangeDetectorRef);

  abstract commandLines: CommandLine[];

  abstract readonly device: Devices;

  refreshCommand(commandLineIndex: number): void {
    this.commandLines = this.commandLines.map((commandLine, index) => {
      if (index === commandLineIndex) {
        return {
          ...commandLine,
          blocks: CommandLineDirector.refreshBlocks(commandLine),
        };
      }
      return { ...commandLine };
    });
    this.cd.detectChanges();
  }

  sendCommand(commandLineIndex: number): void {
    const commandLine = this.commandLines.at(commandLineIndex) as CommandLine;
    this.write.emit(CommandLineDirector.getValue(commandLine));
  }
}
