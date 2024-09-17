"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
exports.default = {
    register: () => {
        electron_1.ipcMain.handle('restart-app', () => {
            // Solicita relanzar la aplicación
            electron_1.app.relaunch();
            // Cierra la aplicación actual
            setTimeout(() => {
                electron_1.app.quit();
            }, 2000);
        });
    }
};
//# sourceMappingURL=restart.js.map