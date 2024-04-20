import {
  ChangeDetectionStrategy,
  Component,
  Input,
  TemplateRef,
} from '@angular/core';
import { EssayTemplateStep } from '../../models/business/database/essay-template-step.model';
import {
  TC_AlignHorizontal,
  TableColumn,
} from '../../models/core/table-column.model';

@Component({
  selector: 'app-steps-sequence-table',
  templateUrl: './steps-sequence-table.component.html',
  styleUrls: ['./steps-sequence-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepsSequenceTableComponent {
  @Input() essayTemplateSteps!: EssayTemplateStep[];
  @Input() actionsTemplate!: TemplateRef<any>;

  readonly EssayTemplateStepTableColumns: TableColumn<EssayTemplateStep>[] = [
    {
      field: 'order',
      header: 'Orden de ejecución',
      alignHorizontal: TC_AlignHorizontal.Number,
    },
    {
      field: 'foreign.step.name',
      header: 'Paso',
      alignHorizontal: TC_AlignHorizontal.Text,
    },
    {
      field: 'form_control_raw.name',
      header: 'Nombre',
      alignHorizontal: TC_AlignHorizontal.Text,
    },
  ];
}
