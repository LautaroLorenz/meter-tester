import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { Step } from '../../../../models/business/database/step.model';

@Component({
  selector: 'app-add-step-to-sequence',
  templateUrl: './add-step-to-sequence.component.html',
  styleUrls: ['./add-step-to-sequence.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddStepToSequenceComponent implements OnChanges {
  @Input() stepOptions!: Step[];

  @Output() selectedStep = new EventEmitter<Step>();

  dialogOpened = false;
  userSelectableStepOptions!: Step[];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.stepOptions) {
      this.userSelectableStepOptions = this.getUserSelectableStepOptions(
        changes.stepOptions.currentValue as Step[]
      );
    }
  }

  openDialog(): void {
    this.dialogOpened = true;
  }

  stepSelected(step: Step): void {
    this.selectedStep.emit({ ...step });
    this.dialogOpened = false;
  }

  private getUserSelectableStepOptions(steps: Step[]): Step[] {
    return steps.filter(
      ({ userSelectableOnCreateEssayTemplate }) =>
        userSelectableOnCreateEssayTemplate
    );
  }
}
