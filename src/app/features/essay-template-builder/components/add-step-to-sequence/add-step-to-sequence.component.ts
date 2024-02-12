import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { Step } from '../../models/step.model';

@Component({
  selector: 'app-add-step-to-sequence',
  templateUrl: './add-step-to-sequence.component.html',
  styleUrls: ['./add-step-to-sequence.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddStepToSequenceComponent implements OnChanges {
  @Input() stepOptions!: Step[];

  @Output() selectedStep = new EventEmitter<Step>();

  detailDialogVisible = false;
  userSelectableStepOptions!: Step[];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.stepOptions) {
      this.userSelectableStepOptions = this.getUserSelectableStepOptions(
        changes.stepOptions.currentValue as Step[]
      );
    }
  }

  openDialog(): void {
    this.detailDialogVisible = true;
  }

  private getUserSelectableStepOptions(steps: Step[]): Step[] {
    return steps.filter(
      ({ userSelectableOnCreateEssayTemplate }) =>
        userSelectableOnCreateEssayTemplate
    );
  }
}
