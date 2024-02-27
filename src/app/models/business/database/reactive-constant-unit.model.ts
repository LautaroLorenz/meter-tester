import { AbmColum } from '../../core/abm.model';
import { DbTableContext } from '../../core/database.model';

export interface ReactiveConstantUnit {
  id: number;
  name: string;
}

export const ReactiveConstantUnitDbTableContext: DbTableContext = {
  tableName: 'reactive_constant_unit',
  rawProperties: [],
  foreignTables: [],
};

export const ReactiveConstantUnitTableColumns: AbmColum[] = [
  {
    field: 'name',
    header: 'Nombre',
    sortable: true,
  },
];
