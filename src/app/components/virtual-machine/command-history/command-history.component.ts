import { ChangeDetectionStrategy, Component, NgZone } from '@angular/core';
import { CommandHistory } from '../../../models/business/interafces/commnad-history.model';
import { DatePipe } from '@angular/common';
import { CommandDirector } from '../../../models/business/class/command-director.model';
import { BehaviorSubject } from 'rxjs';
import { DeviceConstantPipe } from '../../../pipes/business/device.pipe';
import {
  TC_AlignHorizontal,
  TableColumn,
} from '../../../models/core/table-column.model';

@Component({
  selector: 'app-command-history',
  templateUrl: './command-history.component.html',
  styleUrls: ['./command-history.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommandHistoryComponent {
  history$ = new BehaviorSubject<CommandHistory[]>([]);
  columns: TableColumn<CommandHistory>[] = [
    {
      header: 'Envia',
      field: 'from',
      alignHorizontal: TC_AlignHorizontal.Text,
    },
    {
      header: 'Recibe',
      field: 'to',
      alignHorizontal: TC_AlignHorizontal.Text,
    },
    {
      header: 'Comando',
      field: 'command',
      alignHorizontal: TC_AlignHorizontal.Text,
      customStyles: 'word-break: break-word; font-family: monospace;',
    },
    {
      header: 'Fecha',
      field: 'date',
      alignHorizontal: TC_AlignHorizontal.Text,
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

  clear(): void {
    this.history$.next([]);
  }
}
