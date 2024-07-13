import { DbForeignKey, DbTableContext } from '../../core/database.model';

export interface Backup extends DbForeignKey {
    id: number;
    saved_time: string;
    selected_folder: string;
    file_name: string;
}

export const BackupDbTableContext: DbTableContext = {
    tableName: 'backups',
    rawProperties: [],
    foreignTables: []
};
