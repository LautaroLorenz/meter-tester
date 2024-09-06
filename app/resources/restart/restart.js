"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
exports.default = {
    register: () => {
        electron_1.ipcMain.handle('restart-app', () => {
            electron_1.app.relaunch(); // Relanza la aplicación
            electron_1.app.exit(0); // Cierra la aplicación actual
        });
    }
};
//# sourceMappingURL=restart.js.map