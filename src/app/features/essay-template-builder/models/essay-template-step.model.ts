import { AbmColum } from '../../../components/abm/models/abm.model';
import { DbForeignKey, DbTableContext } from '../../../models/database.model';
import {
  EssayTemplate,
  EssayTemplateDbTableContext,
} from '../../available-test/models/essay-template.model';
import { Step, StepDbTableContext } from './step.model';

export interface EssayTemplateStep extends DbForeignKey {
  id: number;
  order: number;
  essay_template_id: number;
  step_id: number;
  actions_raw_data: any[];
  foreign: {
    essayTemplate?: EssayTemplate;
    step?: Step;
  };
}

export const EssayTemplateStepDbTableContext: DbTableContext = {
  tableName: 'essay_templates_steps',
  foreignTables: [
    {
      tableName: EssayTemplateDbTableContext.tableName,
      foreignKey: 'essay_template_id',
      properyName: 'essayTemplate',
    },
    {
      tableName: StepDbTableContext.tableName,
      foreignKey: 'step_id',
      properyName: 'step',
    },
  ],
};

export const EssayTemplateStepTableColumns: AbmColum[] = [
  {
    field: 'order',
    header: 'Orden de ejecución',
    sortable: false,
  },
];
