import { app, ipcMain } from 'electron';

export default {
    register: () => {
        ipcMain.handle('restart-app', () => {
            app.relaunch();  // Relanza la aplicación
            app.exit(0);     // Cierra la aplicación actual
        });
    }
}