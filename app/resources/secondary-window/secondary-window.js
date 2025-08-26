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
let mainWindow = null;
let openedWindows = [];
let baseUrl = null;
let inspector = false;
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
function openOffset(options) {
    // abrir ventnas con un pequeño offset
    const display = electron_1.screen.getPrimaryDisplay();
    const { width: screenWidth, height: screenHeight } = display.workAreaSize;
    const windowWidth = (options === null || options === void 0 ? void 0 : options.width) || Math.floor(screenWidth / 1.5);
    const windowHeight = (options === null || options === void 0 ? void 0 : options.height) || Math.floor(screenHeight / 1.5);
    const offset = openedWindows.length * 40; // desplazamiento progresivo
    const x = Math.floor(screenWidth / 2 - windowWidth / 2) + offset;
    const y = Math.floor(screenHeight / 2 - windowHeight / 2) + offset;
    return {
        x,
        y,
        width: windowWidth,
        height: windowHeight
    };
}
function openWindow(url, options) {
    const windowUrl = `${baseUrl}/${url}`;
    const windowIsOpen = openedWindows.find((window) => window.url === windowUrl);
    if (windowIsOpen) {
        windowIsOpen.window.focus();
        return windowIsOpen;
    }
    const window = new electron_1.BrowserWindow(Object.assign(Object.assign(Object.assign({}, openOffset()), { webPreferences: {
            nodeIntegration: true,
            allowRunningInsecureContent: true,
            contextIsolation: false,
            devTools: inspector
        }, alwaysOnTop: false }), options));
    window.setMenuBarVisibility(false);
    window.loadURL(windowUrl);
    const windowitem = {
        id: window.id,
        url: windowUrl,
        window,
        isReady: false,
        close: () => closeWindowById(window.id)
    };
    openedWindows.push(windowitem);
    // Abrir un canal para poder enviar comandos desde la ventana principal a la secundaria
    const listener = (_, args) => {
        window.webContents.send('from-main-window', args);
    };
    electron_1.ipcMain.on(`from-main-to-window-id-${window.id}`, listener);
    window.on('closed', () => {
        openedWindows = openedWindows.filter((window) => window.id !== window.id);
        electron_1.ipcMain.removeListener(`from-main-to-window-id-${window.id}`, listener);
    });
    return windowitem;
}
exports.default = {
    setMainWindow: (mainWindowParam) => {
        mainWindow = mainWindowParam;
    },
    openWindow,
    closeWindowById,
    closeAllOpenedWindow,
    setConfig: (settings) => {
        baseUrl = settings.baseUrl;
        inspector = settings.inspector;
    },
    register: () => {
        electron_1.ipcMain.handle('open-secondary-window', (_, params) => __awaiter(void 0, void 0, void 0, function* () {
            const windowItem = openWindow(params.url, params.options);
            return windowItem.id;
        }));
        electron_1.ipcMain.handle('close-secondary-window', (_, windowId) => __awaiter(void 0, void 0, void 0, function* () {
            closeWindowById(windowId);
        }));
        // Llamando este método desde la ventana secundaria, indicamos al proceso principal que ya está Ready
        electron_1.ipcMain.handle('get-secondary-window-id', (event) => {
            const win = electron_1.BrowserWindow.fromWebContents(event.sender);
            const windowId = win ? win.id : null;
            if (windowId) {
                const windowItem = openedWindows.find((item) => item.id === windowId);
                if (windowItem) {
                    windowItem.isReady = true;
                    mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.webContents.send(`secondary-window-id-${windowId}-is-ready`);
                }
            }
            return windowId;
        });
        // Desde el proceso principal, podemos verificar si una ventana esta ready si tenemos el id
        electron_1.ipcMain.handle('is-secondary-window-ready', (_, windowId) => __awaiter(void 0, void 0, void 0, function* () {
            const windowItem = openedWindows.find((item) => item.id === windowId);
            if (!windowItem)
                return false;
            return windowItem.isReady;
        }));
    }
};
//# sourceMappingURL=secondary-window.js.map