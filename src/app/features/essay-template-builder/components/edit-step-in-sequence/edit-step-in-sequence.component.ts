import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { EssayTemplateStep } from '../../../../models/business/database/essay-template-step.model';
import { Steps } from '../../../../models/business/enums/steps.model';

@Component({
  selector: 'app-edit-step-in-sequence',
  templateUrl: './edit-step-in-sequence.component.html',
  styleUrls: ['./edit-step-in-sequence.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditStepInSequenceComponent implements OnChanges {
  @Input() essayTemplateStep: EssayTemplateStep | undefined;

  @Output() dialogHide = new EventEmitter<void>();
  @Output() essayTemplateStepChange = new EventEmitter<
    Partial<EssayTemplateStep>
  >();

  dialogOpened = false;
  formValid = false;
  formValue: Partial<EssayTemplateStep> | undefined;

  readonly Steps = Steps;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.essayTemplateStep) {
      this.dialogOpened = !!changes.essayTemplateStep.currentValue;
    }
  }

  closeDialog(): void {
    this.dialogOpened = false;
    this.essayTemplateStep = undefined;
    this.formValid = false;
  }

  acceptChanges(): void {
    if (!this.formValue) {
      return;
    }
    this.essayTemplateStepChange.emit(this.formValue);
    this.dialogOpened = false;
  }
}
