import { Injectable } from '@angular/core';
import {
    BehaviorSubject,
    Observable,
    ReplaySubject,
    Subject,
    concatMap,
    tap,
    takeUntil,
    of,
    switchMap,
    filter,
    take
} from 'rxjs';
import { IpcService } from './ipc.service';
import { CommandInvokeResponse } from '../models/business/interafces/command-invoke-response.model';

@Injectable({
    providedIn: 'root'
})
export class DeviceService {
    /*
     * cola de llamados a write$
     */
    private queue = new Subject<{
        command: string;
        request: Observable<CommandInvokeResponse>;
        response: ReplaySubject<CommandInvokeResponse>;
    }>();

    private _readQueueCommands$ = new BehaviorSubject<string[]>([]);

    private _abort$ = new Subject<void>();
    private _currentCommand$ = new BehaviorSubject<boolean>(false);

    constructor(private readonly ipcService: IpcService) {
        this.queue
            .pipe(
                tap(({ command }) => this.addCommandToReadQueue(command)),
                concatMap(({ request, response }) => {
                    this._currentCommand$.next(true);
                    return request.pipe(
                        takeUntil(this._abort$),
                        tap((result) => {
                            response.next(result);
                            response.complete();
                        }),
                        tap(() => {
                            this.popCommandFromReadQueue();
                            this._currentCommand$.next(false);
                        })
                    );
                })
            )
            .subscribe();
    }

    /**
     * Retorna un string[] para saber que comandos hay encolados, es de lectura.
     */
    get readQueueCommands$(): Observable<string[]> {
        return this._readQueueCommands$.asObservable();
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
        const request = this.ipcService.invoke$<CommandInvokeResponse>('software-write', { command });
        this.queue.next({ command, request, response });
        return response.asObservable();
    }

    abort$(): Observable<void> {
        // Clear queued commands immediately
        this._readQueueCommands$.next([]);

        // If no command is currently processing, emit immediately
        if (!this._currentCommand$.value) {
            this._abort$.next();
            return of(void 0);
        }

        // If a command is processing, wait for it to complete
        return this._currentCommand$.pipe(
            filter((isProcessing) => !isProcessing),
            take(1),
            tap(() => this._abort$.next()),
            switchMap(() => of(void 0))
        );
    }

    private addCommandToReadQueue(command: string): void {
        this._readQueueCommands$.next([command, ...this._readQueueCommands$.value]);
    }

    private popCommandFromReadQueue(): void {
        this._readQueueCommands$.next(this._readQueueCommands$.value.slice(0, -1));
    }
}
