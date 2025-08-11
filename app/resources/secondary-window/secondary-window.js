"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
let openedWindows = [];
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
exports.default = {
    openWindow: (url, options) => {
        const windowIsOpen = openedWindows.find((window) => window.url === url);
        if (windowIsOpen) {
            return windowIsOpen;
        }
        const window = new electron_1.BrowserWindow(Object.assign({ x: 0, y: 0, width: 1240, height: 720, webPreferences: {
                nodeIntegration: true,
                allowRunningInsecureContent: true,
                contextIsolation: false
            }, alwaysOnTop: true }, options));
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
//# sourceMappingURL=secondary-window.js.map