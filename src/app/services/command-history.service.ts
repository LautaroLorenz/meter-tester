import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CommandHistory } from '../models/business/interafces/commnad-history.model';
import { DeviceConstantPipe } from '../pipes/business/device.pipe';
import { DatePipe } from '@angular/common';
import { CommandDirector } from '../models/business/class/command-director.model';
import { IpcService } from './ipc.service';

@Injectable({
    providedIn: 'root'
})
export class CommandHistoryService {
    private history$ = new BehaviorSubject<CommandHistory[]>([]);

    constructor(
        private readonly datePipe: DatePipe,
        private readonly deviceConstantPipe: DeviceConstantPipe,
        private readonly ipcService: IpcService,
        private readonly ngZone: NgZone
    ) {
        this.ipcService.on('command-history', (_: any, commands: string[]) => {
            this.ngZone.run(() => {
                if (!commands.length) {
                    this.history$.next([]);
                    return;
                }
                const command = commands[commands.length - 1];
                this.history$.next([
                    {
                        from: this.deviceConstantPipe.transform(CommandDirector.getFrom(command)),
                        to: this.deviceConstantPipe.transform(CommandDirector.getTo(command)),
                        command,
                        date: this.datePipe.transform(new Date(), 'HH:mm:ss.SSS') || ''
                    },
                    ...this.history$.value
                ]);
            });
        });
    }

    get history(): CommandHistory[] {
        return this.history$.value;
    }

    getHistory$(): Observable<CommandHistory[]> {
        return this.history$.asObservable();
    }

    clearHistory(): void {
        this.ipcService.send('clear-history');
    }

    subscribeToHistory(): void {
        this.ipcService.invoke$('subscribe-to-history').subscribe();
    }
}
