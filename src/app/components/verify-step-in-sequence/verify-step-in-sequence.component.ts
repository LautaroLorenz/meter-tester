import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EditDialogComponent } from '../../models/core/edit-dialog.model';
import { EssayStep } from '../../models/business/interafces/essay-step.model';
import { EssayTemplateStep } from '../../models/business/database/essay-template-step.model';

@Component({
  selector: 'app-verify-step-in-sequence',
  templateUrl: './verify-step-in-sequence.component.html',
  styleUrls: ['./verify-step-in-sequence.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerifyStepInSequenceComponent extends EditDialogComponent<EssayStep> {
  override afterSuperChanges(): void {
    this.formValue = this.initialValue;
  }

  onStepValueChange(value: EssayTemplateStep): void {
    this.formValue = value as EssayStep;
  }
}
