import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import { RunEssayService } from '../../../services/run-essay.service';
import { PreparationStep } from '../interafces/steps/preparation-step.model';
import { EssayStep } from '../interafces/essay-step.model';
import { StepStatus } from '../enums/step-status.model';
import { ResultStatus } from '../enums/result-status.model';
import { EnumAsOptionPipe } from '../../../pipes/core/enum-as-option.pipe';
import { ActiveStand } from '../interafces/active-stand.model';
import { Subject } from 'rxjs/internal/Subject';
import { Observable } from 'rxjs';
import { BlockUIService } from '../../../services/block-ui.service';
import { DeviceService } from '../../../services/device.service';

@Component({
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export abstract class TestRunComponent<T extends EssayStep>
  implements OnInit, OnDestroy
{
  @Input() currentStep!: T;
  @Input() preparationStep!: PreparationStep;

  canContinue = false;

  protected readonly runEssayService = inject(RunEssayService);
  protected readonly cd = inject(ChangeDetectorRef);
  protected readonly EnumAsOptionPipe = inject(EnumAsOptionPipe);
  protected readonly blockUIService = inject(BlockUIService);
  protected readonly deviceService = inject(DeviceService);
  protected readonly onDestroy = new Subject<void>();

  abstract readonly skipEnabled: boolean;

  ngOnInit(): void {
    this.runEssayService.canDeactivate = this.abort.bind(this);
  }

  ngOnDestroy(): void {
    this.runEssayService.canDeactivate = null;
    this.onDestroy.next();
    this.onDestroy.complete();
  }

  getActiveStands(): ActiveStand[] {
    return this.runEssayService.getActiveStands(this.preparationStep);
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
      const stand = this.runEssayService.getStandResult(
        this.currentStep.id,
        index
      );
      const { resultStatus } = stand.getRawValue();
      if (resultStatus !== ResultStatus.Failed) {
        stand.patchValue({ resultStatus: ResultStatus.Approved });
      }
    });
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

  protected isAllStandsWithResultLocked(): boolean {
    return this.getActiveStands().every(
      ({ index }) =>
        this.runEssayService
          .getStandResult(this.currentStep.id, index)
          .getRawValue().resultStatus === ResultStatus.Locked
    );
  }

  protected checkFailedStatus(): void {
    this.getActiveStands().forEach(({ index }) => {
      const stand = this.runEssayService.getStandResult(
        this.currentStep.id,
        index
      );
      const result = stand.getRawValue();
      if (this.isFailCondition(result)) {
        stand.patchValue({ resultStatus: ResultStatus.Failed });
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

  abstract abort(): Observable<boolean>;

  abstract isFailCondition(...args: any[]): boolean;

  abstract startTest(): void;

  abstract stopTest(): void;

  abstract restartResults(resultStatus: ResultStatus): void;
}
