import { BrowserWindow, dialog, ipcMain } from 'electron';
import { dataBasePath } from './databasePath';
import * as path from 'path';
import * as fs from 'fs';

let mainWindow: BrowserWindow;

export default {
    register: () => {
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

            try {
                const backupFilePath = path.join(backupPath, `backup-${formattedDate}-${formattedTime}-database.db`);
                fs.copyFileSync(dataBasePath, backupFilePath);
                return { success: true, message: 'Backup completed successfully' };
            } catch (error: any) {
                return { success: false, message: `Backup failed: ${error?.message}` };
            }
        });
    },
    setMainWindow: (mainWindowParam: BrowserWindow) => {
        mainWindow = mainWindowParam;
    }
};
