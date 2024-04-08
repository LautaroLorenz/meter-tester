import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TestRunComponent } from '../../../../models/business/class/test-run-component.model';
import { BootTestEssayStep } from '../../../../models/business/interafces/steps/boot-test-step.model';

@Component({
  selector: 'app-boot-test-run',
  templateUrl: './boot-test-run.component.html',
  styleUrls: ['./boot-test-run.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BootTestRunComponent extends TestRunComponent<BootTestEssayStep> {
  @Input() currentStep!: BootTestEssayStep;

  onManualGeneratorAdjusted(): void {
    this.startTest();
  }

  // TODO
  override isFailCondition(): boolean {
    return false;
  }

  // TODO
  private startTest(): void {
    console.log('start');
  }
}
