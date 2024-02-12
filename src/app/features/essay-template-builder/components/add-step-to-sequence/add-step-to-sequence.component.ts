import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { Step } from '../../models/step.model';

@Component({
  selector: 'app-add-step-to-sequence',
  templateUrl: './add-step-to-sequence.component.html',
  styleUrls: ['./add-step-to-sequence.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddStepToSequenceComponent {
  @Input() stepOptions!: Step[];

  @Output() selectedStep = new EventEmitter<Step>();
}
