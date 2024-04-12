import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { TestRunComponent } from '../../../../models/business/class/test-run-component.model';
import {
  ContrastTestEssayStep,
  ContrastTestStandResult,
} from '../../../../models/business/interafces/steps/contrast-test-step.model';
import { ResultStatus } from '../../../../models/business/enums/result-status.model';
import { APP_CONFIG } from '../../../../../environments/environment';
import { StepRunMode } from '../../../../models/business/enums/step-run-mode';
import { EnumAsOption } from '../../../../models/core/enum-as-option.model';
import { CalculatorComponent } from '../../../machine/calculator/calculator.component';
import { PatternComponent } from '../../../machine/pattern/pattern.component';

@Component({
  selector: 'app-contrast-test-run',
  templateUrl: './contrast-test-run.component.html',
  styleUrls: ['./contrast-test-run.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContrastTestRunComponent extends TestRunComponent<ContrastTestEssayStep> {
  @ViewChild('calculator', { static: true }) calculator!: CalculatorComponent;
  @ViewChild('pattern', { static: true }) pattern!: PatternComponent;

  stepRunMode = StepRunMode.continuousResultUpdate;

  override readonly skipEnabled = APP_CONFIG.skipSteps.contrastTestRun;

  readonly StepRunModes: EnumAsOption[] = this.EnumAsOptionPipe.transform(
    'StepRunMode',
    StepRunMode
  );

  onManualGeneratorAdjusted(): void {
    this.startTest();
  }

  // TODO
  override isFailCondition(result: ContrastTestStandResult): boolean {
    return false;
  }

  // TODO
  override startTest(): void {
    this.pattern
      .constant$(
        this.currentStep.form_control_raw.phaseL1,
        this.currentStep.form_control_raw.phaseL2,
        this.currentStep.form_control_raw.phaseL3
      )
      .subscribe();
    console.log('start');
  }

  // TODO
  override stopTest(): void {
    console.log('stop');
  }

  // TODO
  override restartResults(resultStatus: ResultStatus): void {
    console.log('re-start');
  }
}
