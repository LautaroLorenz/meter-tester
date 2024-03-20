import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { RunEssayService } from '../../../services/run-essay.service';
import { EssayStep } from '../../../models/business/interafces/essay-step.model';
import { StepStatus } from '../../../models/business/enums/step-status.model';
import { Observable, take, tap } from 'rxjs';
import { MajorStepsDirector } from '../../../models/business/class/major-steps-director.model';
import { APP_CONFIG } from '../../../../environments/environment';

@Component({
  selector: 'app-verification-major-step',
  templateUrl: './verification-major-step.component.html',
  styleUrls: ['./verification-major-step.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerificationMajorStepComponent implements OnInit {
  verificationSteps: EssayStep[] | undefined;
  selectedEssayStep: EssayStep | undefined;
  isVerificationDone = false;

  readonly StepStatus = StepStatus;

  constructor(private readonly runEssayService: RunEssayService) {}

  get isRunEssayFormValid(): boolean {
    return this.runEssayService.runEssayForm.valid;
  }

  get verificationSteps$(): Observable<EssayStep[]> {
    return this.runEssayService.verificationSteps$.pipe(
      tap((verificationSteps) => (this.verificationSteps = verificationSteps))
    );
  }

  ngOnInit(): void {
    this.skip();
  }

  setSelectedStep(essayStep: EssayStep): void {
    this.selectedEssayStep = essayStep;
  }

  saveVerifiedStepInSequenceChanges(essayStep: EssayStep): void {
    if (!this.selectedEssayStep) {
      return;
    }
    if (typeof this.selectedEssayStep.order !== 'number') {
      return;
    }
    this.runEssayService.getEssayStep(essayStep.id)?.patchValue(essayStep);
    this.markVerifiedStep(essayStep, StepStatus.Done);
  }

  markVerifiedAll(): void {
    if (this.isVerificationDone) {
      return;
    }
    this.verificationSteps?.forEach((essayStep) =>
      this.markVerifiedStep(essayStep, StepStatus.Done)
    );
  }

  markVerifiedStep(essayStep: EssayStep, status: StepStatus): void {
    this.runEssayService
      .getEssayStep(essayStep.id)
      .get('verifiedStatus')
      ?.setValue(status);

    this.isVerificationDone = MajorStepsDirector.checkMajorStepStatus(
      this.verificationSteps || [],
      StepStatus.Done,
      'verifiedStatus'
    );
  }

  continue(): void {
    if (!this.isVerificationDone) {
      return;
    }
    this.runEssayService.nextMajorStep();
  }

  private skip(): void {
    if (!APP_CONFIG.skipSteps) {
      return;
    }

    this.verificationSteps$.pipe(take(1)).subscribe(() => {
      this.markVerifiedAll();
      setTimeout(() => this.continue());
    });
  }
}
