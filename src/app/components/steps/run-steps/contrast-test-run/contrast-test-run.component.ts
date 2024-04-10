import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestRunComponent } from '../../../../models/business/class/test-run-component.model';
import {
  ContrastTestEssayStep,
  ContrastTestStandResult,
} from '../../../../models/business/interafces/steps/contrast-test-step.model';
import { ResultStatus } from '../../../../models/business/enums/result-status.model';
import { APP_CONFIG } from '../../../../../environments/environment';

@Component({
  selector: 'app-contrast-test-run',
  templateUrl: './contrast-test-run.component.html',
  styleUrls: ['./contrast-test-run.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContrastTestRunComponent extends TestRunComponent<ContrastTestEssayStep> {
  override readonly skipEnabled = APP_CONFIG.skipSteps.contrastTestRun;

  onManualGeneratorAdjusted(): void {
    this.startTest();
  }

  // TODO
  override isFailCondition(result: ContrastTestStandResult): boolean {
    return false;
  }

  // TODO
  override startTest(): void {
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
