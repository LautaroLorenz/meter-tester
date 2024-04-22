import { DbForeignKey, DbTableContext } from '../../core/database.model';

export type Tags = Record<string, string> | string[] | Record<string, string>[];

export interface Static extends DbForeignKey {
  id: number;
  saved_time: number;
  metric: string;
  tags_raw: Tags;
}

export const StaticDbTableContext: DbTableContext = {
  tableName: 'statics',
  rawProperties: ['tags_raw'],
  foreignTables: [],
};
