import { app, ipcMain } from 'electron';

export default {
    register: () => {
        ipcMain.handle('restart-app', () => {
            app.relaunch();  // Relanza la aplicación
            app.quit();     // Cierra la aplicación actual
        });
    }
}