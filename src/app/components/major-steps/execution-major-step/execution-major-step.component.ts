import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { EssayStep } from '../../../models/business/interafces/essay-step.model';
import { ExecutionDirector } from '../../../models/business/class/execution-director.model';
import { RunEssayService } from '../../../services/run-essay.service';
import { StepStatus } from '../../../models/business/enums/step-status.model';
import { Observable, forkJoin, take, tap } from 'rxjs';
import { PhotocellAdjustmentStatus } from '../../../models/business/enums/photocell-adjustment-status.model';

@Component({
  selector: 'app-execution-major-step',
  templateUrl: './execution-major-step.component.html',
  styleUrls: ['./execution-major-step.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExecutionMajorStepComponent implements OnInit {
  executionSteps: EssayStep[] | undefined;
  preparationStep: EssayStep | undefined;
  currentStep: EssayStep | undefined;

  readonly PhotocellAdjustmentStatus = PhotocellAdjustmentStatus;

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

  get currentStep$(): Observable<EssayStep | undefined> {
    return this.runEssayService.currentStep$.pipe(
      tap((currentStep) => (this.currentStep = currentStep))
    );
  }

  ngOnInit(): void {
    forkJoin({
      executionSteps: this.executionSteps$.pipe(take(1)),
      preparationStep: this.preparationStep$.pipe(take(1)),
    }).subscribe(({ executionSteps, preparationStep }) => {
      this.initExecutionsProps(executionSteps, preparationStep);
      this.start();
    });
  }

  photocellAdjustmentDone(stepId: number): void {
    this.runEssayService
      .getEssayStep(stepId)
      .get('photocellAdjustmentStatus')
      ?.setValue(PhotocellAdjustmentStatus.Done);
  }

  private start(): void {
    if (!this.executionSteps?.length) {
      return;
    }

    this.runEssayService
      .getEssayStep(this.executionSteps[0].id)
      .get('executedStatus')
      ?.setValue(StepStatus.Current);
  }

  private initExecutionsProps(
    essaySteps: EssayStep[],
    preparationStep: EssayStep
  ): void {
    essaySteps.forEach((essayStep, index) => {
      // estado de la ejecución
      this.runEssayService
        .getEssayStep(essayStep.id)
        .get('executedStatus')
        ?.setValue(StepStatus.Pending);

      // estado del ajuste de fotocélulas
      const photocellAdjustmentStatus =
        ExecutionDirector.getInitialPhotocellAdjustmentStatus(
          essaySteps,
          index
        );
      this.runEssayService
        .getEssayStep(essayStep.id)
        .get('photocellAdjustmentStatus')
        ?.setValue(photocellAdjustmentStatus);

      // estado del resultado de los stands activos
      essayStep.standResults.forEach((_, standIndex) => {
        const standResultStatus = ExecutionDirector.getInitialStandResultStatus(
          preparationStep,
          standIndex
        );

        this.runEssayService
          .getStandResult(essayStep.id, standIndex)
          .get('resultStatus')
          ?.setValue(standResultStatus);
      });
    });
  }
}
