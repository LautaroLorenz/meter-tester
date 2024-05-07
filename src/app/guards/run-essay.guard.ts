import { CanDeactivateFn } from '@angular/router';
import { Observable, of } from 'rxjs';
import { ComponentCanDeactivate } from '../models/core/guards.model';
import { inject } from '@angular/core';
import { RunEssayService } from '../services/run-essay.service';

export const RunEssayGuard: CanDeactivateFn<ComponentCanDeactivate> = ():
  | Observable<boolean>
  | boolean => {
  const runEssayService = inject(RunEssayService);

  if (typeof runEssayService.canDeactivate === 'function') {
    return runEssayService.canDeactivate();
  }
  return of(true);
};
