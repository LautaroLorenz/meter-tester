import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { RunEssayService } from '../../../services/run-essay.service';
import { EssayStep } from '../../../models/business/interafces/essay-step.model';
import { MajorStepsDirector } from '../../../models/business/class/major-steps-director.model';
import { MajorSteps } from '../../../models/business/enums/major-steps.model';
import { StepStatus } from '../../../models/business/enums/step-status.model';

@Component({
  selector: 'app-verification-major-step',
  templateUrl: './verification-major-step.component.html',
  styleUrls: ['./verification-major-step.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerificationMajorStepComponent
  implements OnChanges, AfterViewInit
{
  @Input() essaySteps!: EssayStep[];

  verificationSteps!: EssayStep[];
  selectedEssayStep: EssayStep | undefined;

  readonly StepStatus = StepStatus;

  constructor(private readonly runEssayService: RunEssayService) {}

  get isVerificationDone(): boolean {
    if (!this.essaySteps) {
      return false;
    }

    return MajorStepsDirector.stepsByMajorStep(
      this.essaySteps,
      MajorSteps.Verification
    ).every(({ verifiedStatus }) => verifiedStatus === StepStatus.Done);
  }

  get isRunEssayFormValid(): boolean {
    return this.runEssayService.runEssayForm.valid;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.essaySteps?.currentValue) {
      this.verificationSteps = MajorStepsDirector.stepsByMajorStep(
        changes.essaySteps.currentValue as EssayStep[],
        MajorSteps.Verification
      );

      if (changes.essaySteps.firstChange) {
        setTimeout(() => this.initVerificationProps(this.verificationSteps));
      }
    }
  }

  // TODO remover
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.markVerifiedAll();
      setTimeout(() => {
        this.continue();
      }, 100);
    }, 100);
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
    this.verificationSteps.forEach((essayStep) =>
      this.markVerifiedStep(essayStep, StepStatus.Done)
    );
  }

  markVerifiedStep(essayStep: EssayStep, status: StepStatus): void {
    this.runEssayService
      .getEssayStep(essayStep.id)
      .get('verifiedStatus')
      ?.setValue(status);
  }

  continue(): void {
    if (!this.isVerificationDone) {
      return;
    }
    this.runEssayService.nextMajorStep();
  }

  private initVerificationProps(essaySteps: EssayStep[]): void {
    essaySteps.forEach((essayStep) =>
      this.markVerifiedStep(essayStep, StepStatus.Pending)
    );
  }
}
