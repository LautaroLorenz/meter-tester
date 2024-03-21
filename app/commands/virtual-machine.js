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
let window = null;
function closeWindow() {
    if (window && !window.isDestroyed() && window.isClosable()) {
        window.close();
    }
}
exports.default = {
    register: () => {
        electron_1.ipcMain.handle('open-virtual-machine', () => __awaiter(void 0, void 0, void 0, function* () {
            if (window && !window.isDestroyed() && window.isFocusable()) {
                window.focus();
                return;
            }
            window = new electron_1.BrowserWindow({
                x: 0,
                y: 0,
                width: 800,
                height: 600,
                webPreferences: {
                    nodeIntegration: true,
                    contextIsolation: false,
                },
            });
            window.setMenuBarVisibility(false);
            window.loadURL('http://localhost:4200');
            return;
        }));
        electron_1.ipcMain.handle('close-virtual-machine', () => __awaiter(void 0, void 0, void 0, function* () {
            closeWindow();
            return;
        }));
    },
    closeWindow,
};
//# sourceMappingURL=virtual-machine.js.map