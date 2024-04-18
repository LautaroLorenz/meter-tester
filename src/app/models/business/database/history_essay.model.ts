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
    },
  ],
};

// TODO
export const HistoryEssayTableColumns: AbmColum[] = [
  //   {
  //     field: 'foreign.brand.name',
  //     header: 'Marca',
  //     sortable: true,
  //   },
  //   {
  //     field: 'model',
  //     header: 'Modelo',
  //     sortable: true,
  //   },
  //   {
  //     field: 'foreign.connection.name',
  //     header: 'Conexión',
  //     sortable: true,
  //   },
  //   {
  //     field: 'maximumCurrent',
  //     header: 'Imax [A]',
  //     sortable: false,
  //     styleClass: 'text-right',
  //     headerTooltip: 'Corriente máxima',
  //   },
  //   {
  //     field: 'ratedCurrent',
  //     header: 'In [A]',
  //     sortable: false,
  //     styleClass: 'text-right',
  //     headerTooltip: 'Corriente nominal',
  //   },
  //   {
  //     field: 'ratedVoltage',
  //     header: 'Un [V]',
  //     sortable: false,
  //     styleClass: 'text-right',
  //     headerTooltip: 'Tensión nominal',
  //   },
  //   {
  //     field: 'activeConstantValue',
  //     header: 'Cte. energía activa',
  //     sortable: false,
  //     styleClass: 'text-right pr-1 border-right-none',
  //     headerTooltip: 'Constante de energía activa',
  //     colSpan: 2,
  //     colSpanColumns: [
  //       {
  //         field: 'foreign.activeConstantUnit.name',
  //         styleClass: 'pl-1 text-left border-left-none',
  //         prefix: '[',
  //         suffix: ']',
  //       },
  //     ],
  //   },
  //   {
  //     field: 'reactiveConstantValue',
  //     header: 'Cte. energía reactiva',
  //     sortable: false,
  //     styleClass: 'text-right pr-1 border-right-none',
  //     headerTooltip: 'Constante de energía reactiva',
  //     colSpan: 2,
  //     colSpanColumns: [
  //       {
  //         field: 'foreign.reactiveConstantUnit.name',
  //         styleClass: 'pl-1 text-left border-left-none',
  //         prefix: '[',
  //         suffix: ']',
  //       },
  //     ],
  //   },
];
