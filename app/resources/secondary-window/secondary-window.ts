import { BrowserWindow, BrowserWindowConstructorOptions } from 'electron';
import { WindowItem } from './window-item.model';

let openedWindows: WindowItem[] = [];

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

// TODO
// - para ventanas productivas se tiene que obtener el link según donde corre el server,
// - poder abrir ventanas desde el proceso angular, solamente con una url.
// - transmitir data a la ventana.
export default {
    openWindow: (url: string, options?: BrowserWindowConstructorOptions): WindowItem => {
        const windowIsOpen = openedWindows.find((window) => window.url === url);
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
            alwaysOnTop: true,
            ...options
        });
        window.setMenuBarVisibility(false);
        window.loadURL(url);
        const windowitem = {
            id: window.id,
            url,
            window,
            close: () => closeWindowById(window.id)
        };
        openedWindows.push(windowitem);
        return windowitem;
    },
    closeWindowById,
    closeAllOpenedWindow
};
