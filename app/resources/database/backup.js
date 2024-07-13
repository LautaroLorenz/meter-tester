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
    register: () => {
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
            try {
                const backupFilePath = path.join(backupPath, `backup-${formattedDate}-${formattedTime}-database.db`);
                fs.copyFileSync(databasePath_1.dataBasePath, backupFilePath);
                return { success: true, message: 'Backup completed successfully' };
            }
            catch (error) {
                return { success: false, message: `Backup failed: ${error === null || error === void 0 ? void 0 : error.message}` };
            }
        }));
    },
    setMainWindow: (mainWindowParam) => {
        mainWindow = mainWindowParam;
    }
};
//# sourceMappingURL=backup.js.map