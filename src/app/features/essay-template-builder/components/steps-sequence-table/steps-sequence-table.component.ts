import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import {
  EssayTemplateStep,
  EssayTemplateStepTableColumns,
} from '../../../../models/business/database/essay-template-step.model';

@Component({
  selector: 'app-steps-sequence-table',
  templateUrl: './steps-sequence-table.component.html',
  styleUrls: ['./steps-sequence-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepsSequenceTableComponent {
  @Input() essayTemplateSteps!: Partial<EssayTemplateStep>[];

  @Output() moveDownStep = new EventEmitter<number>();
  @Output() moveUpStep = new EventEmitter<number>();
  @Output() editStep = new EventEmitter<EssayTemplateStep>();
  @Output() deleteStep = new EventEmitter<number>();

  readonly EssayTemplateStepTableColumns = EssayTemplateStepTableColumns;
}
