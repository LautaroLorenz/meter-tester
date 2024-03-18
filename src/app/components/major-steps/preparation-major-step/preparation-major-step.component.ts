import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { EssayStep } from '../../../models/business/interafces/essay-step.model';

@Component({
  selector: 'app-preparation-major-step',
  templateUrl: './preparation-major-step.component.html',
  styleUrls: ['./preparation-major-step.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreparationMajorStepComponent {
  @Input() essaySteps!: EssayStep[];
}
