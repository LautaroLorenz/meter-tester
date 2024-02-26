import { AbmColum } from '../../../components/abm/models/abm.model';
import { DbForeignKey, DbTableContext } from '../../core/database.model';
import {
  EssayTemplate,
  EssayTemplateDbTableContext,
} from './essay-template.model';
import { Step, StepDbTableContext } from './step.model';

export interface EssayTemplateStep extends DbForeignKey {
  id: number;
  order: number;
  essay_template_id: number;
  step_id: number;
  form_control_raw: any;
  foreign: {
    essayTemplate?: EssayTemplate;
    step?: Step;
  };
}

export const EssayTemplateStepDbTableContext: DbTableContext = {
  tableName: 'essay_templates_steps',
  rawProperties: ['form_control_raw'],
  foreignTables: [
    {
      tableName: EssayTemplateDbTableContext.tableName,
      foreignKey: 'essay_template_id',
      propertyName: 'essayTemplate',
    },
    {
      tableName: StepDbTableContext.tableName,
      foreignKey: 'step_id',
      propertyName: 'step',
    },
  ],
};

export const EssayTemplateStepTableColumns: AbmColum[] = [
  {
    field: 'order',
    header: 'Orden de ejecución',
    sortable: false,
  },
  {
    field: 'foreign.step.name',
    header: 'Paso',
    sortable: false,
  },
  {
    field: 'form_control_raw.name',
    header: 'Nombre',
    sortable: false,
  },
];
