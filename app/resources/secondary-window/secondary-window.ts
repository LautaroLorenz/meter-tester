import { BrowserWindow, BrowserWindowConstructorOptions, ipcMain } from 'electron';
import { WindowItem } from './models/window-item.model';
import { WindowOpenParams } from './models/window-open-params.model';

let openedWindows: WindowItem[] = [];
let baseUrl: string = 'http://localhost:4200';

function closeAllOpenedWindow(): void {
    openedWindows.forEach((window) => {
        closeWindow(window);
    });
    openedWindows = [];
}

function closeWindow(item: WindowItem): void {
    if (item.window && !item.window.isDestroyed() && item.window.isClosable()) {
        item.window.close();
        openedWindows = openedWindows.filter((window) => window.id !== item.id);
    }
}

function closeWindowById(windowId: number) {
    const findedItem = openedWindows.find((window) => window.id === windowId);
    if (findedItem) {
        closeWindow(findedItem);
    }
}

function openWindow(url: string, options?: BrowserWindowConstructorOptions): WindowItem {
    const windowUrl = `${baseUrl}/${url}`;
    const windowIsOpen = openedWindows.find((window) => window.url === windowUrl);
    if (windowIsOpen) {
        return windowIsOpen;
    }
    const window = new BrowserWindow({
        x: 0,
        y: 0,
        width: 1240,
        height: 720,
        webPreferences: {
            nodeIntegration: true,
            allowRunningInsecureContent: true,
            contextIsolation: false
        },
        alwaysOnTop: false,
        ...options
    });
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
export default {
    openWindow,
    closeWindowById,
    closeAllOpenedWindow,
    register: () => {
        ipcMain.handle('open-secondary-window', async (_, params: WindowOpenParams) => {
            const windowItem = openWindow(params.url, params.options);
            return windowItem.id;
        });
        ipcMain.handle('close-secondary-window', async (_, windowId: number) => {
            closeWindowById(windowId);
        });
    }
};
