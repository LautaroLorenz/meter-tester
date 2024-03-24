import {
  ChangeDetectionStrategy,
  Component,
  Input,
  forwardRef,
} from '@angular/core';
import { CommandBlockComponent } from '../../../models/business/class/command-block.model';

@Component({
  selector: 'app-command-variable-block',
  templateUrl: './command-variable-block.component.html',
  styleUrls: ['./command-variable-block.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: CommandBlockComponent,
      useExisting: forwardRef(() => CommandVariableBlockComponent),
    },
  ],
})
export class CommandVariableBlockComponent extends CommandBlockComponent {
  @Input() value!: string;

  override refreshValue(): void {
    // TODO
  }

  override getCommandBlock(): string {
    // TODO

    return this.value;
  }
}
