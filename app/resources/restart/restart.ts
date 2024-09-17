import { app, ipcMain } from 'electron';

export default {
    register: () => {
        ipcMain.handle('restart-app', () => {
            // Solicita relanzar la aplicación
            app.relaunch();
            // Cierra la aplicación actual
            setTimeout(() => {
                app.quit();
            }, 2000);
        });
    }
}