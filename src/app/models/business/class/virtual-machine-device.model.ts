import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
} from '@angular/core';
import { Devices } from '../enums/devices.model';
import { CommandsEnum } from '../enums/commands.model';
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

  abstract readonly commandLines: CommandLine[];

  abstract readonly device: Devices;

  getCommandLineValue(commandName: CommandsEnum): string | undefined {
    const commandLine = this.commandLines.find(
      ({ name }) => name === commandName
    );
    if (!commandLine) {
      return;
    }
    return CommandLineDirector.getValue(commandLine);
  }

  refreshCommand(commandLineIndex: number): void {
    const commandLine = this.commandLines.at(commandLineIndex) as CommandLine;
    commandLine.blocks = CommandLineDirector.refreshBlocks(commandLine);
  }

  sendCommand(commandLineIndex: number): void {
    const commandLine = this.commandLines.at(commandLineIndex) as CommandLine;
    this.write.emit(CommandLineDirector.getValue(commandLine));
  }
}
