import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  inject,
} from '@angular/core';
import { RunEssayService } from '../../../services/run-essay.service';
import { PreparationStep } from '../interafces/steps/preparation-step.model';
import { Stand } from '../interafces/stand.model';
import { EssayStep } from '../interafces/essay-step.model';
import { StepStatus } from '../enums/step-status.model';

@Component({
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export abstract class TestRunComponent {
  @Input() preparationStep!: PreparationStep;

  protected readonly runEssayService = inject(RunEssayService);
  protected readonly cd = inject(ChangeDetectorRef);

  getActiveStands(): { index: number; stand: Stand }[] {
    return this.preparationStep.form_control_raw
      .map((stand, index) => ({ stand, index }))
      .filter(({ stand: { isActive } }) => isActive);
  }

  stepExectionDone(essayStep: EssayStep): void {
    this.runEssayService
      .getEssayStep(essayStep.id)
      .get('executedStatus')
      ?.setValue(StepStatus.Done);
  }
}
