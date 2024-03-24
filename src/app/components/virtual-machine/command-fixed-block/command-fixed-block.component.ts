import {
  ChangeDetectionStrategy,
  Component,
  Input,
  forwardRef,
} from '@angular/core';
import { CommandBlockComponent } from '../../../models/business/class/command-block.model';

@Component({
  selector: 'app-command-fixed-block',
  templateUrl: './command-fixed-block.component.html',
  styleUrls: ['./command-fixed-block.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: CommandBlockComponent,
      useExisting: forwardRef(() => CommandFixedBlockComponent),
    },
  ],
})
export class CommandFixedBlockComponent extends CommandBlockComponent {
  @Input() value!: string;

  override refreshValue(): void {}

  override getCommandBlock(): string {
    return this.value;
  }
}
