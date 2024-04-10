import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestRunComponent } from '../../../../models/business/class/test-run-component.model';
import {
  ContrastTestEssayStep,
  ContrastTestStandResult,
} from '../../../../models/business/interafces/steps/contrast-test-step.model';

@Component({
  selector: 'app-contrast-test-run',
  templateUrl: './contrast-test-run.component.html',
  styleUrls: ['./contrast-test-run.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContrastTestRunComponent extends TestRunComponent<ContrastTestEssayStep> {
  // TODO
  override isFailCondition(result: ContrastTestStandResult): boolean {
    return false;
  }
}
