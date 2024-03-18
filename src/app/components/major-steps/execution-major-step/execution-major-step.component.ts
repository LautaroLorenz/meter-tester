import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { EssayStep } from '../../../models/business/interafces/essay-step.model';
import { MajorStepsDirector } from '../../../models/business/class/major-steps-director.model';
import { MajorSteps } from '../../../models/business/enums/major-steps.model';
import { ExecutionStepsDirector } from '../../../models/business/class/execution-steps-director.model';
import { RunEssayService } from '../../../services/run-essay.service';

@Component({
  selector: 'app-execution-major-step',
  templateUrl: './execution-major-step.component.html',
  styleUrls: ['./execution-major-step.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExecutionMajorStepComponent implements OnChanges {
  @Input() essaySteps!: EssayStep[];

  executionSteps!: EssayStep[];
  preparationStep!: EssayStep;

  constructor(private readonly runEssayService: RunEssayService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.essaySteps?.currentValue) {
      this.executionSteps = MajorStepsDirector.stepsByMajorStep(
        changes.essaySteps.currentValue as EssayStep[],
        MajorSteps.Execution
      );
      this.preparationStep = MajorStepsDirector.stepsByMajorStep(
        changes.essaySteps.currentValue as EssayStep[],
        MajorSteps.Preparation
      )[0];

      if (changes.essaySteps.firstChange) {
        setTimeout(() =>
          this.initExecutionsProps(this.executionSteps, this.preparationStep)
        );
      }
    }
  }

  private initExecutionsProps(
    essaySteps: EssayStep[],
    preparationStep: EssayStep
  ): void {
    essaySteps.forEach((essayStep, index) => {
      const photocellAdjustmentStatus =
        ExecutionStepsDirector.getInitialPhotocellAdjustmentStatus(
          essaySteps,
          index
        );
      this.runEssayService
        .getEssayStep(essayStep.id)
        .get('photocellAdjustmentStatus')
        ?.setValue(photocellAdjustmentStatus);

      essayStep.standResults.forEach((_, standIndex) => {
        const standResultStatus =
          ExecutionStepsDirector.getInitialStandResultStatus(
            preparationStep,
            standIndex
          );

        this.runEssayService
          .getEssayStandResult(essayStep.id, standIndex)
          .get('resultStatus')
          ?.setValue(standResultStatus);
      });
    });
  }
}
