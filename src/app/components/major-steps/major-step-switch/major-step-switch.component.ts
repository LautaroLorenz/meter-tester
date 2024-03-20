import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MajorSteps } from '../../../models/business/enums/major-steps.model';
import { StepStatus } from '../../../models/business/enums/step-status.model';
import { RunEssayService } from '../../../services/run-essay.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-major-step-switch',
  templateUrl: './major-step-switch.component.html',
  styleUrls: ['./major-step-switch.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MajorStepSwitchComponent {
  readonly MajorSteps = MajorSteps;

  constructor(private readonly runEssayService: RunEssayService) {}

  get majorStepStatusMap$(): Observable<Record<MajorSteps, StepStatus>> {
    return this.runEssayService.majorStepStatusMap$;
  }

  getCurrentMajorStep(
    majorStepStatusMap: Record<MajorSteps, StepStatus>
  ): MajorSteps {
    const [currentMajorStep] =
      Object.entries(majorStepStatusMap).find(
        ([, stepStatus]) => stepStatus === StepStatus.Current
      ) || [];
    return currentMajorStep as MajorSteps;
  }
}
