import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-command-history',
  templateUrl: './command-history.component.html',
  styleUrls: ['./command-history.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommandHistoryComponent {

}
