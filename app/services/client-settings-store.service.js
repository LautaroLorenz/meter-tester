"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientSettingsStoreService = void 0;
const client_settings_1 = require("../resources/client-settings/client-settings");
const Store = require("electron-store");
const store = new Store({
    name: 'client-settings'
});
class ClientSettingsStoreService {
    /**
     * Obtiene las client-settings del store
     */
    getClientSettings() {
        try {
            const version = store.get('clientSettingsVersion');
            const companyName = store.get('clientSettingsCompanyName');
            const brandDescription = store.get('clientSettingsBrandDescription');
            if (version && companyName && brandDescription) {
                return {
                    version: version,
                    companyName: companyName,
                    brandDescription: brandDescription
                };
            }
            return null;
        }
        catch (error) {
            console.error('Error getting client settings from store:', error);
            return null;
        }
    }
    /**
     * Guarda las client-settings en el store
     */
    setClientSettings(settings) {
        try {
            store.set('clientSettingsVersion', settings.version);
            store.set('clientSettingsCompanyName', settings.companyName);
            store.set('clientSettingsBrandDescription', settings.brandDescription);
        }
        catch (error) {
            console.error('Error setting client settings in store:', error);
        }
    }
    /**
     * Verifica si las client-settings existen en el store
     */
    hasClientSettings() {
        return (store.has('clientSettingsVersion') &&
            store.has('clientSettingsCompanyName') &&
            store.has('clientSettingsBrandDescription'));
    }
    /**
     * Obtiene las client-settings con lógica de versionado
     * Si no existen en el store, usa las por defecto
     * Si existen pero la versión es diferente, las actualiza completamente
     */
    getClientSettingsWithVersioning() {
        const storedSettings = this.getClientSettings();
        if (!storedSettings) {
            // No hay settings en el store, usar las por defecto
            this.setClientSettings(client_settings_1.DEFAULT_CLIENT_SETTINGS);
            return client_settings_1.DEFAULT_CLIENT_SETTINGS;
        }
        // Verificar si la versión almacenada es diferente a la por defecto
        if (storedSettings.version !== client_settings_1.DEFAULT_CLIENT_SETTINGS.version) {
            // Versión diferente: sobrescribir completamente con los valores por defecto
            this.setClientSettings(client_settings_1.DEFAULT_CLIENT_SETTINGS);
            return client_settings_1.DEFAULT_CLIENT_SETTINGS;
        }
        // Misma versión: mantener los valores existentes en el store
        return storedSettings;
    }
    /**
     * Resetea las client-settings a los valores por defecto
     */
    resetToDefaults() {
        this.setClientSettings(client_settings_1.DEFAULT_CLIENT_SETTINGS);
    }
}
exports.ClientSettingsStoreService = ClientSettingsStoreService;
//# sourceMappingURL=client-settings-store.service.js.map