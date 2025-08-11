import { ipcMain } from 'electron';
import secondaryWindow from '../secondary-window/secondary-window';
import { WindowItem } from '../secondary-window/models/window-item.model';

let secondaryWindowItem: WindowItem | null = null;

export default {
    register: () => {
        ipcMain.handle('open-command-history', async () => {
            secondaryWindowItem = secondaryWindow.openWindow('http://localhost:4200/historial-comandos', {
                alwaysOnTop: true
            });
            return;
        });

        ipcMain.handle('close-command-history', async () => {
            secondaryWindowItem?.close();
            return;
        });
    }
};
