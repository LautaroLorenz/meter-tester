import { BrowserWindow, ipcMain } from 'electron';

let window: BrowserWindow | null = null;

function closeWindow(): void {
  if (window && !window.isDestroyed() && window.isClosable()) {
    window.close();
  }
}

export default {
  register: () => {
    ipcMain.handle('open-command-history', async () => {
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
          allowRunningInsecureContent: true,
          contextIsolation: false,
        },
        alwaysOnTop: true,
      });
      window.setMenuBarVisibility(false);
      window.loadURL('http://localhost:4200/historial-comandos');
      return;
    });

    ipcMain.handle('close-command-history', async () => {
      closeWindow();
      return;
    });
  },
  closeWindow,
};
