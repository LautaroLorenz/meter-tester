/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { IpcService } from './ipc.service';
import { HistoryEssayStepStand } from '../models/business/database/history_essay_step_stand.model';
import { HistoryEssay } from '../models/business/database/history-essay.model';

@Injectable({
  providedIn: 'root',
})
export class HistoryEssayService {
  constructor(private readonly ipcService: IpcService) {}

  saveHistoryEssay$(
    historyEssay: Omit<HistoryEssay, 'id' | 'foreign'>,
    historyEssayRows: Omit<
      HistoryEssayStepStand,
      'id' | 'history_essay_id' | 'foreign'
    >[]
  ): Observable<{
    historyEssay: HistoryEssay;
    historyEssayRows: HistoryEssayStepStand[];
  }> {
    return from(
      this.ipcService.invoke('save-history-essay', {
        historyEssay,
        historyEssayRows,
      })
    );
  }
}
