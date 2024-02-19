import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { EssayTemplateStep } from '../../../../models/business/database/essay-template-step.model';

@Component({
  selector: 'app-essay-template-step-form',
  templateUrl: './essay-template-step-form.component.html',
  styleUrls: ['./essay-template-step-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EssayTemplateStepFormComponent {
  @Input() essayTemplateStep!: EssayTemplateStep;
}
