import {
  ChangeDetectionStrategy,
  Component,
  Input,
  TemplateRef,
} from '@angular/core';
import {
  EssayTemplateStep,
  EssayTemplateStepTableColumns,
} from '../../models/business/database/essay-template-step.model';

@Component({
  selector: 'app-steps-sequence-table',
  templateUrl: './steps-sequence-table.component.html',
  styleUrls: ['./steps-sequence-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepsSequenceTableComponent {
  @Input() essayTemplateSteps!: EssayTemplateStep[];
  @Input() actionsTemplate!: TemplateRef<any>;

  readonly EssayTemplateStepTableColumns = EssayTemplateStepTableColumns;
}
