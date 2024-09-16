import { DbForeignKey, DbTableContext } from '../../core/database.model';

export interface VirtualPattern extends DbForeignKey {
    id: number;
    current: number;
    constant: number;
}

export const VirtualPatternDbTableContext: DbTableContext = {
    tableName: 'virtual_patterns',
    rawProperties: [],
    foreignTables: []
};
