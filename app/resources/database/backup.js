"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const databasePath_1 = require("./databasePath");
const path = require("path");
const fs = require("fs");
let mainWindow;
exports.default = {
    register: (knex) => {
        // seleccionar carpeta donde será guardado el backup
        electron_1.ipcMain.handle('select-backup-folder', () => __awaiter(void 0, void 0, void 0, function* () {
            if (!mainWindow) {
                return null;
            }
            const result = yield electron_1.dialog.showOpenDialog(mainWindow, {
                title: 'Seleccionar carpeta para guardar el Backup',
                buttonLabel: 'Seleccionar',
                properties: ['openDirectory']
            });
            if (result.canceled) {
                return null;
            }
            else {
                return result.filePaths[0];
            }
        }));
        // crear backup
        electron_1.ipcMain.handle('backup-database', (event, backupPath) => __awaiter(void 0, void 0, void 0, function* () {
            const date = new Date();
            const formattedDate = date.toISOString().split('T')[0]; // Formato YYYY-MM-DD
            const formattedTime = date.toTimeString().split(' ')[0].replace(/:/g, '-'); // Formato HH-MM-SS
            const fileName = `backup-${formattedDate}-${formattedTime}-database.db`;
            let id = undefined;
            try {
                // actualizar la BBDD con los datos del backup (para que queden en el backup)
                const result = yield knex('backups')
                    .insert({
                    saved_time: date.getTime(),
                    selected_folder: backupPath,
                    file_name: fileName
                });
                id = result[0];
                // crear archivo de backup                
                const backupFilePath = path.join(backupPath, fileName);
                fs.copyFileSync(databasePath_1.dataBasePath, backupFilePath);
                return { success: true, message: 'Backup completed successfully' };
            }
            catch (error) {
                if (id !== undefined) {
                    // en caso de error limpiar el registro de la BBDD con la fecha del último backup
                    yield knex('backups').delete().where('id', id);
                }
                return { success: false, message: `Backup failed: ${error === null || error === void 0 ? void 0 : error.message}` };
            }
        }));
        // restaurar un backup
        electron_1.ipcMain.handle('restore-backup-database', () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield electron_1.dialog.showOpenDialog(mainWindow, {
                title: 'Seleccionar archivo de backup',
                buttonLabel: 'Seleccionar',
                properties: ['openFile'],
                filters: [{ name: 'Archivos de backup', extensions: ['db'] }] // Cambia la extensión según tu archivo
            });
            if (result.canceled || result.filePaths.length === 0) {
                return { success: false, message: 'No file selected' };
            }
            const backupFilePath = result.filePaths[0];
            try {
                // Reemplazar la base de datos actual con el archivo de backup
                fs.copyFileSync(backupFilePath, databasePath_1.dataBasePath);
                return { success: true, message: 'Database restored successfully' };
            }
            catch (error) {
                return { success: false, message: `Restore failed: ${error === null || error === void 0 ? void 0 : error.message}` };
            }
        }));
    },
    setMainWindow: (mainWindowParam) => {
        mainWindow = mainWindowParam;
    }
};
//# sourceMappingURL=backup.js.map