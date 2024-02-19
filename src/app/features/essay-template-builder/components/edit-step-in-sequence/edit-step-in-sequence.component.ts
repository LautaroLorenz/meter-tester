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

@Component({
  selector: 'app-edit-step-in-sequence',
  templateUrl: './edit-step-in-sequence.component.html',
  styleUrls: ['./edit-step-in-sequence.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditStepInSequenceComponent implements OnChanges {
  @Input() essayTemplateStep: EssayTemplateStep | undefined;

  @Output() dialogHide = new EventEmitter<void>();

  dialogOpened = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.essayTemplateStep) {
      this.dialogOpened = !!changes.essayTemplateStep.currentValue;
    }
  }
}
