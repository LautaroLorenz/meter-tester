import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { IpcService } from './ipc.service';

export interface ClientSettings {
    version: string;
    companyName: string;
    brandDescription: string;
}

@Injectable({
    providedIn: 'root'
})
export class ClientSettingsService {
    private readonly IPC_CHANNEL_GET_CLIENT_SETTINGS = 'get-client-settings';
    private readonly IPC_CHANNEL_SET_CLIENT_SETTINGS = 'set-client-settings';

    constructor(private readonly ipcService: IpcService) {}

    /**
     * Obtiene las client-settings desde el proceso principal
     */
    getClientSettings$(): Observable<ClientSettings> {
        return this.ipcService.invoke$(this.IPC_CHANNEL_GET_CLIENT_SETTINGS);
    }

    /**
     * Actualiza las client-settings en el proceso principal
     */
    setClientSettings$(settings: ClientSettings): Observable<void> {
        return this.ipcService.invoke$(this.IPC_CHANNEL_SET_CLIENT_SETTINGS, settings);
    }

    /**
     * Obtiene solo el nombre de la empresa
     */
    getCompanyName$(): Observable<string> {
        return this.getClientSettings$().pipe(map((settings) => settings.companyName));
    }

    /**
     * Obtiene solo la descripción de la marca
     */
    getBrandDescription$(): Observable<string> {
        return this.getClientSettings$().pipe(map((settings) => settings.brandDescription));
    }
}
