import { AbmColum } from '../../../components/abm/models/abm.model';
import { DbTableContext } from '../../core/database.model';

export interface ActiveConstantUnit {
  id: number;
  name: string;
}

export const ActiveConstantUnitDbTableContext: DbTableContext = {
  tableName: 'active_constant_unit',
  rawProperties: [],
  foreignTables: [],
};

export const ActiveConstantUnitTableColumns: AbmColum[] = [
  {
    field: 'name',
    header: 'Nombre',
    sortable: true,
  },
];
