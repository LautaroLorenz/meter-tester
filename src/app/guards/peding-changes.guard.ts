import { CanDeactivateFn } from '@angular/router';
import { Observable } from 'rxjs';
import { ComponentCanDeactivate } from '../models/core/guards.model';

export const PendingChangesGuard: CanDeactivateFn<ComponentCanDeactivate> = (
  component: ComponentCanDeactivate
): Observable<boolean> | boolean => {
  return component.canDeactivate();
};
