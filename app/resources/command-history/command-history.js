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
const secondary_window_1 = require("../secondary-window/secondary-window");
let secondaryWindowItem = null;
exports.default = {
    register: () => {
        electron_1.ipcMain.handle('open-command-history', () => __awaiter(void 0, void 0, void 0, function* () {
            secondaryWindowItem = secondary_window_1.default.openWindow('http://localhost:4200/historial-comandos', {
                alwaysOnTop: true
            });
            return;
        }));
        electron_1.ipcMain.handle('close-command-history', () => __awaiter(void 0, void 0, void 0, function* () {
            secondaryWindowItem === null || secondaryWindowItem === void 0 ? void 0 : secondaryWindowItem.close();
            return;
        }));
    }
};
//# sourceMappingURL=command-history.js.map