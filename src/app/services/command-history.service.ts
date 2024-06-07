import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CommandHistory } from '../models/business/interafces/commnad-history.model';
import { DeviceConstantPipe } from '../pipes/business/device.pipe';
import { DatePipe } from '@angular/common';
import { CommandDirector } from '../models/business/class/command-director.model';

@Injectable({
  providedIn: 'root',
})
export class CommandHistoryService {
  private history$ = new BehaviorSubject<CommandHistory[]>([]);
  constructor(
    private readonly datePipe: DatePipe,
    private readonly ngZone: NgZone,
    private readonly deviceConstantPipe: DeviceConstantPipe
  ) {}

  get history(): CommandHistory[] {
    return this.history$.value;
  }

  getHistory$(): Observable<CommandHistory[]> {
    return this.history$.asObservable();
  }

  addCommand(command: string): void {
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

  clearHistory(): void {
    this.history$.next([]);
  }
}
