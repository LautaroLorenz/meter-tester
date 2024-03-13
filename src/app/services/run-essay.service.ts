import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class RunEssayService {
  currentMajorStepIndex!: number;

  reset(): void {
    this.currentMajorStepIndex = 0;
  }
}
