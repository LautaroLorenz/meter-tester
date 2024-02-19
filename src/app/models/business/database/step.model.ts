import { AbmColum } from '../../../components/abm/models/abm.model';
import { DbForeignKey, DbTableContext } from '../../core/database.model';

export interface Step extends DbForeignKey {
  id: number;
  name: string;
  userSelectableOnCreateEssayTemplate: boolean;
}

export const StepDbTableContext: DbTableContext = {
  tableName: 'steps',
  foreignTables: [],
};

export const StepTableColumns: AbmColum[] = [
  {
    field: 'name',
    header: 'Paso',
    sortable: true,
  },
];
