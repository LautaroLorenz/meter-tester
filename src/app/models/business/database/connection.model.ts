import { AbmColum } from '../../../components/abm/models/abm.model';
import { DbTableContext } from '../../core/database.model';

export interface Connection {
  id: number;
  name: string;
}

export const ConnectionDbTableContext: DbTableContext = {
  tableName: 'connections',
  foreignTables: [],
};

export const ConnectionTableColumns: AbmColum[] = [
  {
    field: 'name',
    header: 'Nombre',
    sortable: true,
  },
];
