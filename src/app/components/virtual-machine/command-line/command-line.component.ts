import {
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  Output,
  QueryList,
} from '@angular/core';
import { CommandBlockComponent } from '../../../models/business/class/command-block.model';

@Component({
  selector: 'app-command-line',
  templateUrl: './command-line.component.html',
  styleUrls: ['./command-line.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommandLineComponent {
  @Input() name!: string;
  @Output() send = new EventEmitter<string>();
  @ContentChildren(CommandBlockComponent, {
    descendants: true,
  })
  commandBlocks!: QueryList<CommandBlockComponent>;

  // TODO tiene blocks, cada block puede ser fijo o variable
  // TODO bloque fijo

  refreshVariableBlocksValues(): void {
    // TODO regenera todos los valores de los bloques variables
  }

  sendCommand(): void {
    let command = '';

    this.commandBlocks.forEach((commandBlock) => {
      command = command.concat(commandBlock.getCommandBlock());
    });

    this.send.emit(command);
  }
}
