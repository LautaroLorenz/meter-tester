import { AbmColum } from '../../core/abm.model';
import { DbForeignKey, DbTableContext } from '../../core/database.model';
import { Meter, MeterDbTableContext } from './meter.model';
import { ResultStatus } from '../enums/result-status.model';

export interface HistoryEssay extends DbForeignKey {
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

export const HistoryEssayDbTableContext: DbTableContext = {
  tableName: 'history_essay',
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

export const HistoryEssayTableColumns: AbmColum[] = [
  {
    field: 'essay_name',
    header: 'Ensayo',
    sortable: true,
  },
  {
    field: 'step_name',
    header: 'Paso',
    sortable: true,
  },
  {
    field: 'foreign.meter.foreign.brand.name',
    header: 'Marca',
    sortable: true,
  },
  {
    field: 'foreign.meter.model',
    header: 'Modelo',
    sortable: true,
  },
  {
    field: 'serial_number',
    header: 'Número de serie',
    sortable: true,
  },
  {
    field: 'year_of_production',
    header: 'Año de fabricación',
    sortable: true,
  },
  {
    field: 'result_status_enum',
    header: 'Resultado',
    sortable: true,
  },
];
