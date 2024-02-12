/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { IpcService } from './ipc.service';
import { EssayTemplateStep } from '../features/essay-template-builder/models/essay-template-step.model';
import { EssayTemplate } from '../features/available-test/models/essay-template.model';

@Injectable({
  providedIn: 'root',
})
export class EssayService {
  constructor(private readonly ipcService: IpcService) {}

  saveEssayTemplate$(
    essayTemplate: EssayTemplate,
    essayTemplateSteps: EssayTemplateStep[]
  ): Observable<{
    essayTemplate: EssayTemplate;
    essayTemplateSteps: EssayTemplateStep[];
  }> {
    return from(
      this.ipcService.invoke('save-essay-template', {
        essayTemplate,
        essayTemplateSteps,
      })
    );
  }
}
