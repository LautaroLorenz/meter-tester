/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { IpcService } from './ipc.service';
import { HistoryEssay } from '../models/business/database/history_essay.model';

@Injectable({
  providedIn: 'root',
})
export class HistoryEssayService {
  constructor(private readonly ipcService: IpcService) {}

  saveHistoryEssay$(historyEssayRows: Omit<HistoryEssay, 'id' | 'foreign'>[]): Observable<{
    historyEssayRows: HistoryEssay[];
  }> {
    return from(
      this.ipcService.invoke('save-history-essay', { historyEssayRows })
    );
  }
}
