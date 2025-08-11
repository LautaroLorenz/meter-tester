import { BrowserWindow, BrowserWindowConstructorOptions, ipcMain, screen } from 'electron';
import { WindowItem } from './models/window-item.model';
import { WindowOpenParams } from './models/window-open-params.model';

let openedWindows: WindowItem[] = [];
let baseUrl: string | null = null;
let inspector: boolean = false;

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

function openOffset(options?: BrowserWindowConstructorOptions): {
    x: number;
    y: number;
    width: number;
    height: number;
} {
    // abrir ventnas con un pequeño offset
    const display = screen.getPrimaryDisplay();
    const { width: screenWidth, height: screenHeight } = display.workAreaSize;

    const windowWidth = options?.width || Math.floor(screenWidth / 1.5);
    const windowHeight = options?.height || Math.floor(screenHeight / 1.5);
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

function openWindow(url: string, options?: BrowserWindowConstructorOptions): WindowItem {
    const windowUrl = `${baseUrl}/${url}`;
    const windowIsOpen = openedWindows.find((window) => window.url === windowUrl);
    if (windowIsOpen) {
        windowIsOpen.window.focus();
        return windowIsOpen;
    }

    const window = new BrowserWindow({
        ...openOffset(),
        webPreferences: {
            nodeIntegration: true,
            allowRunningInsecureContent: true,
            contextIsolation: false,
            devTools: inspector
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

    // Abrir un canal para poder enviar comandos desde la ventana principal a la secundaria
    const listener = (_: any, args: any) => {
        window.webContents.send('from-main-window', args);
    };
    ipcMain.on(`from-main-to-window-id-${window.id}`, listener);

    window.on('closed', () => {
        openedWindows = openedWindows.filter((window) => window.id !== window.id);
        ipcMain.removeListener(`from-main-to-window-id-${window.id}`, listener);
    });
    return windowitem;
}

export default {
    openWindow,
    closeWindowById,
    closeAllOpenedWindow,
    setConfig: (settings: { baseUrl: string; inspector: boolean }) => {
        baseUrl = settings.baseUrl;
        inspector = settings.inspector;
    },
    register: () => {
        ipcMain.handle('open-secondary-window', async (_, params: WindowOpenParams) => {
            const windowItem = openWindow(params.url, params.options);
            return windowItem.id;
        });
        ipcMain.handle('close-secondary-window', async (_, windowId: number) => {
            closeWindowById(windowId);
        });
        ipcMain.handle('get-secondary-window-id', (event) => {
            const win = BrowserWindow.fromWebContents(event.sender);
            return win ? win.id : null;
        });
    }
};
