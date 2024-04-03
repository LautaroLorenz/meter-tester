import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BlockUIService {
  private _blocked$ = new BehaviorSubject<boolean>(false);

  get blocked$(): Observable<boolean> {
    return this._blocked$.asObservable();
  }

  setBlocked(status: boolean): void {
    this._blocked$.next(status);
  }
}
