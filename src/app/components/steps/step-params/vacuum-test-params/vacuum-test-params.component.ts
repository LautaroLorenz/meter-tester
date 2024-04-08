import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VacuumTestEssayStep } from '../../../../models/business/interafces/steps/vacuum-step.model';
import { StepParamsComponent } from '../../../../models/business/class/step-params-component.model';

@Component({
  selector: 'app-vacuum-test-params',
  templateUrl: './vacuum-test-params.component.html',
  styleUrls: ['./vacuum-test-params.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VacuumTestParamsComponent extends StepParamsComponent<VacuumTestEssayStep> {}
