import { DbTableContext } from '../../core/database.model';

export interface ReactiveConstantUnit {
    id: number;
    name: string;
}

export const ReactiveConstantUnitDbTableContext: DbTableContext = {
    tableName: 'reactive_constant_unit',
    rawProperties: [],
    foreignTables: []
};
