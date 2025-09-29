"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const client_settings_store_service_1 = require("../services/client-settings-store.service");
let clientSettingsStore;
exports.default = {
    register: () => {
        clientSettingsStore = new client_settings_store_service_1.ClientSettingsStoreService();
        // Obtener client-settings
        electron_1.ipcMain.handle('get-client-settings', () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                return clientSettingsStore.getClientSettingsWithVersioning();
            }
            catch (error) {
                console.error('Error getting client settings:', error);
                throw error;
            }
        }));
        // Establecer client-settings
        electron_1.ipcMain.handle('set-client-settings', (event, settings) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                clientSettingsStore.setClientSettings(settings);
            }
            catch (error) {
                console.error('Error setting client settings:', error);
                throw error;
            }
        }));
    }
};
//# sourceMappingURL=client-settings.js.map