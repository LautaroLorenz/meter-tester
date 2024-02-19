import { AbmColum } from '../../../components/abm/models/abm.model';
import { DbForeignKey, DbTableContext } from '../../core/database.model';

export interface Brand extends DbForeignKey {
  id: number;
  name: string;
  model: string;
  connection_id: number;
  foreign: object;
}

export const BrandDbTableContext: DbTableContext = {
  tableName: 'brands',
  foreignTables: [],
};

export const BrandTableColumns: AbmColum[] = [
  {
    field: 'name',
    header: 'Marca',
    sortable: true,
    styleClass: 'w-9',
  },
];
