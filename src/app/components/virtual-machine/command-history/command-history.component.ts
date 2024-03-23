import { ChangeDetectionStrategy, Component, NgZone } from '@angular/core';
import {
  CommandHistory,
  CommandHistoryColumn,
} from '../../../models/business/interafces/commnad-history.model';
import { DatePipe } from '@angular/common';
import { CommandDirector } from '../../../models/business/class/command-director.model';
import { BehaviorSubject } from 'rxjs';
import { DeviceConstantPipe } from '../../../pipes/business/device.pipe';

@Component({
  selector: 'app-command-history',
  templateUrl: './command-history.component.html',
  styleUrls: ['./command-history.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommandHistoryComponent {
  history$ = new BehaviorSubject<CommandHistory[]>([]);
  columns: CommandHistoryColumn[] = [
    {
      header: 'Envia',
      field: 'from',
    },
    {
      header: 'Recibe',
      field: 'to',
    },
    {
      header: 'Comando',
      field: 'command',
    },
    {
      header: 'Fecha',
      field: 'date',
    },
  ];

  constructor(
    private readonly datePipe: DatePipe,
    private readonly ngZone: NgZone,
    private readonly deviceConstantPipe: DeviceConstantPipe
  ) {}

  add(command: string): void {
    this.ngZone.run(() => {
      const commandHistory: CommandHistory = {
        from: this.deviceConstantPipe.transform(
          CommandDirector.getFrom(command)
        ),
        to: this.deviceConstantPipe.transform(CommandDirector.getTo(command)),
        command,
        date: this.datePipe.transform(new Date(), 'HH:mm:ss.SSS') || '',
      };
      this.history$.next([commandHistory, ...this.history$.value]);
    });
  }
}
