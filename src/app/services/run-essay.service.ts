import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class RunEssayService {
  currentMajorStepIndex!: number;

  reset(): void {
    // resetear los estados de los pasos y de los resultados, en base a eso calcular el current major step
    this.currentMajorStepIndex = 1;
  }
}
