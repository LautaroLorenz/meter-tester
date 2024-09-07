import { DbForeignKey, DbTableContext } from '../../core/database.model';
import { Brand, BrandDbTableContext } from './brand.model';
import { ActiveConstantUnit, ActiveConstantUnitDbTableContext } from './active-constant-unit.model';
import { Connection, ConnectionDbTableContext } from './connection.model';
import { ReactiveConstantUnit, ReactiveConstantUnitDbTableContext } from './reactive-constant-unit.model';
import { BarcodeScannerParams } from '../interafces/barcode-scanner-params.model';

export interface Meter extends DbForeignKey {
    id: number;
    model: string;
    maximumCurrent: number;
    ratedCurrent: number;
    ratedVoltage: number;
    activeConstantValue: number;
    activeConstantUnit_id: number;
    reactiveConstantValue: number;
    reactiveConstantUnit_id: number;
    brand_id: number;
    connection_id: number;
    isBarcodeScannerEnabled: boolean;
    barcodeScannerParams_raw: BarcodeScannerParams;
    foreign: {
        brand: Brand;
        activeConstantUnit: ActiveConstantUnit;
        reactiveConstantUnit: ReactiveConstantUnit;
        connection: Connection;
    };
}

export const MeterDbTableContext: DbTableContext = {
    tableName: 'meters',
    rawProperties: ['barcodeScannerParams_raw'],
    foreignTables: [
        {
            tableName: ConnectionDbTableContext.tableName,
            foreignKey: 'connection_id',
            propertyName: 'connection'
        },
        {
            tableName: BrandDbTableContext.tableName,
            foreignKey: 'brand_id',
            propertyName: 'brand'
        },
        {
            tableName: ActiveConstantUnitDbTableContext.tableName,
            foreignKey: 'activeConstantUnit_id',
            propertyName: 'activeConstantUnit'
        },
        {
            tableName: ReactiveConstantUnitDbTableContext.tableName,
            foreignKey: 'reactiveConstantUnit_id',
            propertyName: 'reactiveConstantUnit'
        }
    ]
};
