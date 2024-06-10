import { DbTableContext } from '../../core/database.model';
import { Meter, MeterDbTableContext } from '../database/meter.model';

export interface StandMeter extends Meter {
    label: string;
}

export interface Stand {
    name: string;
    isActive: boolean;
    meter_id: number;
    serialNumber: string;
    yearOfProduction: string;
    foreign: {
        meter: StandMeter;
    };
}

export const StandDbTableContext: DbTableContext = {
    tableName: '',
    rawProperties: [],
    foreignTables: [
        {
            tableName: MeterDbTableContext.tableName,
            foreignKey: 'meter_id',
            propertyName: 'meter'
        }
    ]
};
