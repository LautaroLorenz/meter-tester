import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, Subject, concatMap, tap } from 'rxjs';
import { IpcService } from './ipc.service';
import { CommandInvokeResponse } from '../models/business/interafces/command-invoke-response.model';

@Injectable({
  providedIn: 'root',
})
export class DeviceService {
  /*
   * cola de llamados a write$
   */
  private queue = new Subject<{
    request: Observable<CommandInvokeResponse>;
    response: ReplaySubject<CommandInvokeResponse>;
  }>();

  constructor(private readonly ipcService: IpcService) {
    this.queue
      .pipe(
        concatMap(({ request, response }) =>
          request.pipe(tap((result) => response.next(result)))
        )
      )
      .subscribe();
  }

  /*
   * Los dispositivos usan write$ para enviar comandos a la máquina.
   * Los comandos se encolan en queue y se envian secuencialmente: commando -> respuesta -> comando -> respuesta
   *
   * Hay dos formas de usar write$
   * 1. Paralelo: Encola los llamados en queue.
   *    write$('comando 1').subscribe();
   *    write$('comando 2').subscribe();
   *
   * 2. Secuencial: Concatena los llamados gracias a return response.asObservable()
   *    write$('comando 1').pipe(switchMap(() => write$('comando 2'))).subscribe();
   */
  write$(command: string): Observable<CommandInvokeResponse> {
    const response = new ReplaySubject<CommandInvokeResponse>(1);
    const request = this.ipcService.invoke$<CommandInvokeResponse>(
      'software-write',
      { command }
    );
    this.queue.next({ request, response });
    return response.asObservable();
  }
}
