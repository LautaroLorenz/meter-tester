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
let openedWindows = [];
let baseUrl = 'http://localhost:4200';
function closeAllOpenedWindow() {
    openedWindows.forEach((window) => {
        closeWindow(window);
    });
    openedWindows = [];
}
function closeWindow(item) {
    if (item.window && !item.window.isDestroyed() && item.window.isClosable()) {
        item.window.close();
        openedWindows = openedWindows.filter((window) => window.id !== item.id);
    }
}
function closeWindowById(windowId) {
    const findedItem = openedWindows.find((window) => window.id === windowId);
    if (findedItem) {
        closeWindow(findedItem);
    }
}
function openWindow(url, options) {
    const windowUrl = `${baseUrl}/${url}`;
    const windowIsOpen = openedWindows.find((window) => window.url === windowUrl);
    if (windowIsOpen) {
        return windowIsOpen;
    }
    const window = new electron_1.BrowserWindow(Object.assign({ x: 0, y: 0, width: 1240, height: 720, webPreferences: {
            nodeIntegration: true,
            allowRunningInsecureContent: true,
            contextIsolation: false
        }, alwaysOnTop: false }, options));
    window.setMenuBarVisibility(false);
    window.loadURL(windowUrl);
    const windowitem = {
        id: window.id,
        url: windowUrl,
        window,
        close: () => closeWindowById(window.id)
    };
    openedWindows.push(windowitem);
    return windowitem;
}
// TODO
// - para ventanas productivas se tiene que obtener el link según donde corre el server,
// - poder abrir ventanas desde el proceso angular, solamente con una url.
// - transmitir data a la ventana.
exports.default = {
    openWindow,
    closeWindowById,
    closeAllOpenedWindow,
    register: () => {
        electron_1.ipcMain.handle('open-secondary-window', (_, params) => __awaiter(void 0, void 0, void 0, function* () {
            const windowItem = openWindow(params.url, params.options);
            return windowItem.id;
        }));
        electron_1.ipcMain.handle('close-secondary-window', (_, windowId) => __awaiter(void 0, void 0, void 0, function* () {
            closeWindowById(windowId);
        }));
    }
};
//# sourceMappingURL=secondary-window.js.map