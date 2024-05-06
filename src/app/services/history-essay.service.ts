/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { IpcService } from './ipc.service';
import { HistoryEssayStepStand } from '../models/business/database/history_essay_step_stand.model';

@Injectable({
  providedIn: 'root',
})
export class HistoryEssayService {
  constructor(private readonly ipcService: IpcService) {}

  saveHistoryEssay$(
    historyEssayRows: Omit<HistoryEssayStepStand, 'id' | 'foreign'>[]
  ): Observable<{
    historyEssayRows: HistoryEssayStepStand[];
  }> {
    return from(
      this.ipcService.invoke('save-history-essay', { historyEssayRows })
    );
  }
}
