import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EssayStep } from '../../../models/business/interafces/essay-step.model';
import { StepStatus } from '../../../models/business/enums/step-status.model';
import { RunEssayService } from '../../../services/run-essay.service';
import { EssayTemplateStep } from '../../../models/business/database/essay-template-step.model';
import { Observable, take, tap } from 'rxjs';
import { MajorStepsDirector } from '../../../models/business/class/major-steps-director.model';

@Component({
  selector: 'app-preparation-major-step',
  templateUrl: './preparation-major-step.component.html',
  styleUrls: ['./preparation-major-step.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreparationMajorStepComponent {
  preparationStep: EssayStep | undefined;
  isPreparationDone = false;

  readonly StepStatus = StepStatus;

  constructor(private readonly runEssayService: RunEssayService) {}

  get isRunEssayFormValid(): boolean {
    return this.runEssayService.runEssayForm.valid;
  }

  get preparationStep$(): Observable<EssayStep> {
    return this.runEssayService.preparationStep$.pipe(
      tap((preparationStep) => (this.preparationStep = preparationStep)),

      // // TODO descomentar para no hacer skip del paso
      // take(1),
      // tap(() => this.skip())
    );
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

    this.isPreparationDone = MajorStepsDirector.checkMajorStepStatus(
      this.preparationStep || [],
      StepStatus.Done,
      'verifiedStatus'
    );
  }

  continue(): void {
    if (!this.preparationStep) {
      return;
    }
    this.markVerifiedStep(this.preparationStep);
    this.runEssayService.nextMajorStep();
  }

  private skip(): void {
    setTimeout(() => {
      this.continue();
    });
  }
}
