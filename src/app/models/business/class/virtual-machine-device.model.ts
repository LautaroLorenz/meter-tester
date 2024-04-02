import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { Devices } from '../enums/devices.model';
import { CommandLine } from '../interafces/command-line.model';
import { CommandLineDirector } from './command-line-director.model';

@Component({
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export abstract class VMDeviceComponent implements OnInit {
  @Output() write = new EventEmitter<string>();

  private readonly cd = inject(ChangeDetectorRef);

  abstract commandLines: CommandLine[];

  abstract readonly device: Devices;

  ngOnInit(): void {
    this.commandLines.forEach((_, index) => this.refreshCommand(index));
  }

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
