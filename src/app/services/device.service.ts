/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { IpcService } from './ipc.service';
import { EssayTemplateStep } from '../models/business/database/essay-template-step.model';
import { EssayTemplate } from '../models/business/database/essay-template.model';

@Injectable({
  providedIn: 'root',
})
export class DeviceService {
  constructor(private readonly ipcService: IpcService) {}

  softwareWrite(command: string): Observable<void> {
    console.log('send', command);
    return from(this.ipcService.invoke('software-write', { command }));
  }

  //   saveEssayTemplate$(
  //     essayTemplate: EssayTemplate,
  //     essayTemplateSteps: EssayTemplateStep[]
  //   ): Observable<{
  //     essayTemplate: EssayTemplate;
  //     essayTemplateSteps: EssayTemplateStep[];
  //   }> {
  //     return from(
  //       this.ipcService.invoke('save-essay-template', {
  //         essayTemplate,
  //         essayTemplateSteps,
  //       })
  //     );
  //   }
}
