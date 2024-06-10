import { DbForeignKey, DbTableContext } from '../../core/database.model';

export interface Step extends DbForeignKey {
    id: number;
    name: string;
    userSelectableOnCreateEssayTemplate: boolean;
}

export const StepDbTableContext: DbTableContext = {
    tableName: 'steps',
    rawProperties: [],
    foreignTables: []
};
