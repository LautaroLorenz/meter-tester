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
