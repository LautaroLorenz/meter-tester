import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { take, tap } from 'rxjs';
import { IpcService } from '../../../../services/ipc.service';

@Component({
    selector: 'app-system-info-dialog',
    templateUrl: './system-info-dialog.component.html',
    styleUrls: ['./system-info-dialog.component.scss']
})
export class SystemInfoDialogComponent implements OnInit {
    @Input() display = false;
    @Output() displayChange = new EventEmitter<boolean>();

    systemInfo = {
        hardwareVersion: 'CE8p-v6',
        softwareVersion: '6.3.0',
        dataBaseVersion: ''
    };

    constructor(private ipcService: IpcService) {}

    ngOnInit(): void {
        this.ipcService
            .invoke$('get-database-version')
            .pipe(
                take(1),
                tap((version: string) => (this.systemInfo.dataBaseVersion = version))
            )
            .subscribe();
    }

    onHide(): void {
        this.displayChange.emit(this.display);
    }
}
