import { DbForeignKey, DbTableContext } from '../../core/database.model';

export interface Brand extends DbForeignKey {
  id: number;
  name: string;
}

export const BrandDbTableContext: DbTableContext = {
  tableName: 'brands',
  rawProperties: [],
  foreignTables: [],
};
