import { BrowserWindow, ipcMain } from 'electron';

let window: BrowserWindow | null = null;

function closeWindow(): void {
  if (window && !window.isDestroyed() && window.isClosable()) {
    window.close();
  }
}

export default {
  register: () => {
    ipcMain.handle('open-virtual-machine', async () => {
      if (window && !window.isDestroyed()) {
        return;
      }
      window = new BrowserWindow({
        x: 0,
        y: 0,
        width: 1240,
        height: 720,
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: false,
        },
      });
      window.setMenuBarVisibility(false);
      window.loadURL('http://localhost:4200/maquina-virtual');
      return;
    });
    ipcMain.handle('close-virtual-machine', async () => {
      closeWindow();
      return;
    });
  },
  closeWindow,
};
