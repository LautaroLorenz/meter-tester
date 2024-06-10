import { DbTableContext } from '../../core/database.model';

export interface Connection {
    id: number;
    name: string;
}

export const ConnectionDbTableContext: DbTableContext = {
    tableName: 'connections',
    rawProperties: [],
    foreignTables: []
};
