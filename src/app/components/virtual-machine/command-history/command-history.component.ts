import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { CommandHistory } from '../../../models/business/interafces/commnad-history.model';
import { TC_AlignHorizontal, TableColumn } from '../../../models/core/table-column.model';
import { DeviceConstants } from '../../../models/business/constants/devices-constant.model';
import { CommandHistoryService } from '../../../services/command-history.service';

@Component({
    selector: 'app-command-history',
    templateUrl: './command-history.component.html',
    styleUrls: ['./command-history.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommandHistoryComponent implements OnInit {
    history$: Observable<CommandHistory[]>;
    columns: TableColumn<CommandHistory>[] = [
        {
            header: 'Envia',
            field: 'from',
            alignHorizontal: TC_AlignHorizontal.Text
        },
        {
            header: 'Recibe',
            field: 'to',
            alignHorizontal: TC_AlignHorizontal.Text
        },
        {
            header: 'Comando',
            field: 'command',
            alignHorizontal: TC_AlignHorizontal.Text,
            customStyles: 'word-break: break-word; font-family: monospace;'
        },
        {
            header: 'Fecha',
            field: 'date',
            alignHorizontal: TC_AlignHorizontal.Text
        }
    ];

    readonly devices = Object.values(DeviceConstants).map((device) => ({
        label: device,
        value: device
    }));

    constructor(public readonly commandHistoryService: CommandHistoryService) {
        this.history$ = this.commandHistoryService.getHistory$();
    }

    ngOnInit(): void {
        this.commandHistoryService.subscribeToHistory();
    }
}
