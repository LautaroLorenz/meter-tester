import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RunEssayService } from '../../../services/run-essay.service';
import { EssayStep } from '../../../models/business/interafces/essay-step.model';
import { Observable, tap } from 'rxjs';

@Component({
  selector: 'app-report-major-step',
  templateUrl: './report-major-step.component.html',
  styleUrls: ['./report-major-step.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportMajorStepComponent {
  executionSteps: EssayStep[] | undefined;
  preparationStep: EssayStep | undefined;
  
  constructor(private readonly runEssayService: RunEssayService) {}

  get executionSteps$(): Observable<EssayStep[]> {
    return this.runEssayService.executionSteps$.pipe(
      tap((executionSteps) => (this.executionSteps = executionSteps))
    );
  }

  get preparationStep$(): Observable<EssayStep> {
    return this.runEssayService.preparationStep$.pipe(
      tap((preparationStep) => (this.preparationStep = preparationStep))
    );
  }
}
