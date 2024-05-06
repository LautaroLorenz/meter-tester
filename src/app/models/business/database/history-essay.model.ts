import { DbForeignKey, DbTableContext } from '../../core/database.model';
import { RunEssay } from '../interafces/run-essay.model';

export interface HistoryEssay extends DbForeignKey {
  id: number;
  run_raw: RunEssay;
}

export const HistoryEssayDbTableContext: DbTableContext = {
  tableName: 'history_essay',
  rawProperties: ['run_raw'],
  foreignTables: [],
};
