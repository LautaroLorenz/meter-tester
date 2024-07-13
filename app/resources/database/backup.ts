import { BrowserWindow, dialog, ipcMain } from 'electron';
import { dataBasePath } from './databasePath';
import * as path from 'path';
import * as fs from 'fs';
import * as KnexLib from 'knex';

let mainWindow: BrowserWindow;

export default {
    register: (knex: KnexLib.Knex) => {
        // seleccionar carpeta donde será guardado el backup
        ipcMain.handle('select-backup-folder', async () => {
            if (!mainWindow) {
                return null;
            }
            const result = await dialog.showOpenDialog(mainWindow, {
                title: 'Seleccionar carpeta para guardar el Backup',
                buttonLabel: 'Seleccionar',
                properties: ['openDirectory']
            });
            if (result.canceled) {
                return null;
            } else {
                return result.filePaths[0];
            }
        });

        // crear backup
        ipcMain.handle('backup-database', async (event, backupPath) => {
            const date = new Date();
            const formattedDate = date.toISOString().split('T')[0]; // Formato YYYY-MM-DD
            const formattedTime = date.toTimeString().split(' ')[0].replace(/:/g, '-'); // Formato HH-MM-SS
            const fileName = `backup-${formattedDate}-${formattedTime}-database.db`;

            let id = undefined;
            try {

                // actualizar la BBDD con los datos del backup (para que queden en el backup)
                const result = await knex('backups')
                    .insert({
                        saved_time: date.getTime(),
                        selected_folder: backupPath,
                        file_name: fileName
                    });
                id = result[0];

                // crear archivo de backup                
                const backupFilePath = path.join(backupPath, fileName);
                fs.copyFileSync(dataBasePath, backupFilePath);

                return { success: true, message: 'Backup completed successfully' };
            } catch (error: any) {

                if (id !== undefined) {
                    // en caso de error limpiar el registro de la BBDD con la fecha del último backup
                    await knex('backups').delete().where('id', id);
                }

                return { success: false, message: `Backup failed: ${error?.message}` };
            }
        });
    },
    setMainWindow: (mainWindowParam: BrowserWindow) => {
        mainWindow = mainWindowParam;
    }
};
