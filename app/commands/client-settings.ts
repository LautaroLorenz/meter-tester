import { ipcMain } from 'electron';
import { ClientSettingsStoreService } from '../services/client-settings-store.service';
import { ClientSettings } from '../client-settings';

let clientSettingsStore: ClientSettingsStoreService;

export default {
    register: () => {
        clientSettingsStore = new ClientSettingsStoreService();

        // Obtener client-settings
        ipcMain.handle('get-client-settings', async (): Promise<ClientSettings> => {
            try {
                return clientSettingsStore.getClientSettingsWithVersioning();
            } catch (error) {
                console.error('Error getting client settings:', error);
                throw error;
            }
        });

        // Establecer client-settings
        ipcMain.handle('set-client-settings', async (event, settings: ClientSettings): Promise<void> => {
            try {
                clientSettingsStore.setClientSettings(settings);
            } catch (error) {
                console.error('Error setting client settings:', error);
                throw error;
            }
        });
    }
};
