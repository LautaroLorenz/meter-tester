import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export abstract class CommandBlockComponent {
  abstract getCommandBlock(): string;
  abstract refreshValue(): void;
}
