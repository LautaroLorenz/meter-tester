import { MessagesService } from './messages.service';
import { ConfirmationService, PrimeIcons } from 'primeng/api';
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, switchMap, of, from, catchError } from 'rxjs';

interface WakeLockSentinel {
  release: () => Promise<void>;
}

@Injectable({
  providedIn: 'root'
})
export class WakeLockService {
  private wakeLock: WakeLockSentinel | null = null;
  private readonly localStorageKeyPermission = 'wakelock-permission';
  private readonly localStorageKeyApiNotSupported = 'wakelock-api-support';
  private wakeLockActiveSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(
    private messagesService: MessagesService,
    private confirmationService: ConfirmationService,
  ) { }

  get wakeLockActive$(): Observable<boolean> {
    return this.wakeLockActiveSubject.asObservable();
  }

  /**
   * Mantener la pantalla encendida durante la ejecución
   */
  activateWakeLock(): Observable<void> {
    const permission = localStorage.getItem(this.localStorageKeyPermission);

    if (permission === 'denied') {
      // No hacer nada si el permiso fue denegado previamente
      return of();
    }

    return of('start').pipe(
      switchMap(() => {
        if ('wakeLock' in navigator) {
          return new Observable<void>((observer) => {
            (navigator as any).wakeLock.request('screen')?.then((lock: WakeLockSentinel | null) => {
              this.wakeLock = lock;
              this.wakeLockActiveSubject.next(true);
              observer.next();
              observer.complete();
            }).catch(() => {
              return this.showPermissionAlert();
            })
          });
        } else {
          const apiNotSupported = localStorage.getItem(this.localStorageKeyApiNotSupported);
          if (apiNotSupported === 'denied') {
            // No hacer nada si el permiso fue denegado previamente
            return of();
          }
          return this.showAPINotSupportedAlert();
        }
      })
    );
  }

  deactivateWakeLock(): Observable<void> {
    if (this.wakeLock) {
      return from(this.wakeLock.release()).pipe(
        switchMap(() => {
          this.wakeLock = null;
          this.wakeLockActiveSubject.next(false);
          return of();
        }),
        catchError(() => {
          this.messagesService.warn('No se pudo reestablecer la configuración de bloqueo de pantalla');
          return of();
        })
      );
    } else {
      return of();
    }
  }

  private showPermissionAlert(): Observable<void> {
    return new Observable<void>((observer) => {
      this.confirmationService.confirm({
        message: 'No se pudo obtener el permiso ¿Quieres que te consultemos nuevamente la próxima vez?',
        header: 'Bloqueo de pantalla',
        icon: PrimeIcons.EXCLAMATION_TRIANGLE,
        defaultFocus: 'accept',
        rejectLabel: 'No volver a preguntar',
        reject: () => {
          localStorage.setItem(this.localStorageKeyPermission, 'denied');
          observer.next();
          observer.complete();
        },
        accept: () => {
          observer.next();
          observer.complete();
        }
      });
    });
  }

  private showAPINotSupportedAlert(): Observable<void> {
    return new Observable<void>((observer) => {
      this.confirmationService.confirm({
        message: 'Debido a un problema con tu equipo deberas configurarlo manualmente para que la pantalla se mantenga encendida durante la ejecución.',
        header: 'Bloqueo de pantalla',
        icon: PrimeIcons.EXCLAMATION_TRIANGLE,
        defaultFocus: 'accept',
        rejectLabel: 'No volver a preguntar',
        acceptLabel: 'Continuar',
        reject: () => {
          localStorage.setItem(this.localStorageKeyApiNotSupported, 'denied');
          observer.next();
          observer.complete();
        },
        accept: () => {
          observer.next();
          observer.complete();
        }
      });
    });

  }
}