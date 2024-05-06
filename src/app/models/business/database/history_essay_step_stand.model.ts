import { DbForeignKey, DbTableContext } from '../../core/database.model';
import { Meter, MeterDbTableContext } from './meter.model';
import { ResultStatus } from '../enums/result-status.model';

export interface HistoryEssayStepStand extends DbForeignKey {
  id: number;
  saved_time: number;
  essay_name: string;
  step_name: string;
  meter_id: number;
  serial_number: string;
  year_of_production: string;
  result_status_enum: ResultStatus;
  foreign: {
    meter: Meter;
  };
}

export const HistoryEssayStepStandDbTableContext: DbTableContext = {
  tableName: 'history_essay_step_stand',
  rawProperties: [],
  foreignTables: [
    {
      tableName: MeterDbTableContext.tableName,
      foreignKey: 'meter_id',
      propertyName: 'meter',
      foreignTables: MeterDbTableContext.foreignTables,
    },
  ],
};
