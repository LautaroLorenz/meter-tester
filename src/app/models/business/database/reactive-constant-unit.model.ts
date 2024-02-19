import { AbmColum } from '../../../components/abm/models/abm.model';
import { DbTableContext } from '../../core/database.model';

export interface ReactiveConstantUnit {
  id: number;
  name: string;
}

export const ReactiveConstantUnitDbTableContext: DbTableContext = {
  tableName: 'reactive_constant_unit',
  foreignTables: [],
};

export const ReactiveConstantUnitTableColumns: AbmColum[] = [
  {
    field: 'name',
    header: 'Nombre',
    sortable: true,
  },
];
