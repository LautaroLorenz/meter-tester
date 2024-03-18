import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { EssayStep } from '../../../models/business/interafces/essay-step.model';
import { MajorStepsDirector } from '../../../models/business/class/major-steps.model';
import { MajorSteps } from '../../../models/business/enums/major-steps.model';

@Component({
  selector: 'app-execution-major-step',
  templateUrl: './execution-major-step.component.html',
  styleUrls: ['./execution-major-step.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExecutionMajorStepComponent implements OnChanges {
  @Input() essaySteps!: EssayStep[];

  executionSteps!: EssayStep[];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.essaySteps?.currentValue) {
      this.executionSteps = MajorStepsDirector.stepsByMajorStep(
        changes.essaySteps.currentValue as EssayStep[],
        MajorSteps.Execution
      );
      // TODO: ver todo lo que hay que hacer inicializar en el run service
    }
  }
}
