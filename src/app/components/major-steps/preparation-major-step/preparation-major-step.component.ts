import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { EssayStep } from '../../../models/business/interafces/essay-step.model';
import { MajorStepsDirector } from '../../../models/business/class/major-steps.model';
import { MajorSteps } from '../../../models/business/enums/major-steps.model';
import { StepStatus } from '../../../models/business/enums/step-status.model';
import { RunEssayService } from '../../../services/run-essay.service';
import { EssayTemplateStep } from '../../../models/business/database/essay-template-step.model';

@Component({
  selector: 'app-preparation-major-step',
  templateUrl: './preparation-major-step.component.html',
  styleUrls: ['./preparation-major-step.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreparationMajorStepComponent implements OnChanges, AfterViewInit {
  @Input() essaySteps!: EssayStep[];

  preparationStep!: EssayStep;

  readonly StepStatus = StepStatus;

  constructor(private readonly runEssayService: RunEssayService) {}

  get isPreparationDone(): boolean {
    if (!this.essaySteps) {
      return false;
    }

    return MajorStepsDirector.stepsByMajorStep(
      this.essaySteps,
      MajorSteps.Preparation
    ).every(({ verifiedStatus }) => verifiedStatus === StepStatus.Done);
  }

  get isRunEssayFormValid(): boolean {
    return this.runEssayService.runEssayForm.valid;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.essaySteps?.currentValue) {
      this.preparationStep = MajorStepsDirector.stepsByMajorStep(
        changes.essaySteps.currentValue as EssayStep[],
        MajorSteps.Preparation
      )[0];
    }
  }

  // TODO remover
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.continue();
    }, 100);
  }

  onFormValueChange(essayTemplateStep: EssayTemplateStep): void {
    this.runEssayService
      .getEssayStep(essayTemplateStep.id)
      ?.patchValue(essayTemplateStep as EssayStep);
  }

  markVerifiedStep(essayStep: EssayStep): void {
    this.runEssayService
      .getEssayStep(essayStep.id)
      .get('verifiedStatus')
      ?.setValue(StepStatus.Done);
  }

  continue(): void {
    this.markVerifiedStep(this.preparationStep);
    this.runEssayService.nextMajorStep();
  }
}
