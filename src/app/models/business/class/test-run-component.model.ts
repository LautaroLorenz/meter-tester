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
import { ResultStatus } from '../enums/result-status.model';

@Component({
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export abstract class TestRunComponent<T extends EssayStep> {
  @Input() currentStep!: T;
  @Input() preparationStep!: PreparationStep;

  canContinue = false;

  protected readonly runEssayService = inject(RunEssayService);
  protected readonly cd = inject(ChangeDetectorRef);

  abstract readonly skipEnabled: boolean;

  getActiveStands(): { index: number; stand: Stand }[] {
    return this.preparationStep.form_control_raw
      .map((stand, index) => ({ stand, index }))
      .filter(({ stand: { isActive } }) => isActive);
  }

  stepExecutionDone(essayStep: EssayStep): void {
    this.runEssayService
      .getEssayStep(essayStep.id)
      .get('executedStatus')
      ?.setValue(StepStatus.Done);
  }

  /**
   * Todos los stands que no fallarón, aprueban
   */
  setApprovedStatus(): void {
    this.getActiveStands().forEach(({ index }) => {
      const control = this.runEssayService.getStandResult(
        this.currentStep.id,
        index
      );
      const { resultStatus } = control.getRawValue();
      if (resultStatus !== ResultStatus.Failed) {
        control.patchValue({ resultStatus: ResultStatus.Approved });
      }
    });

    // TODO: si todos aprobaron continuar automaticamente.
  }

  getCanContinue(): boolean {
    return this.getActiveStands().every(({ index }) => {
      const { resultStatus } = this.runEssayService
        .getStandResult(this.currentStep.id, index)
        .getRawValue();

      return (
        resultStatus === ResultStatus.Failed ||
        resultStatus === ResultStatus.Approved
      );
    });
  }

  restart(): void {
    this.restartResults(ResultStatus.Pending);
    this.canContinue = this.getCanContinue();
    this.startTest();
  }

  protected isAllStandsFailed(): boolean {
    return this.getActiveStands().every(
      ({ index }) =>
        this.runEssayService
          .getStandResult(this.currentStep.id, index)
          .getRawValue().resultStatus === ResultStatus.Failed
    );
  }

  protected checkFailedStatus(): void {
    this.getActiveStands().forEach(({ index }) => {
      const result = this.currentStep.standResults[index];
      if (this.isFailCondition(result)) {
        this.runEssayService
          .getStandResult(this.currentStep.id, index)
          .patchValue({ resultStatus: ResultStatus.Failed });
      }
    });
    this.cd.detectChanges();
  }

  protected skip(): void {
    if (!this.skipEnabled) {
      return;
    }
    this.stepExecutionDone(this.currentStep);
  }

  // TODO
  private onDeactivate(): void {
    // TODO resolver situación cuando el usuario sale de la pantalla
    // TODO esto debería estar en TestRunComponent
  }

  abstract isFailCondition(...args: any[]): boolean;

  abstract startTest(): void;

  abstract stopTest(): void;

  abstract restartResults(resultStatus: ResultStatus): void;
}
