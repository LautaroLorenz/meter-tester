import { CanDeactivate } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface ComponentCanDeactivate {
  canDeactivate: () => Observable<boolean>;
}

@Injectable()
export class PendingChangesGuard
  implements CanDeactivate<ComponentCanDeactivate>
{
  canDeactivate(component: ComponentCanDeactivate): Observable<boolean> {
    return component.canDeactivate();
  }
}
