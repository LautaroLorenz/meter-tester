import { Injectable } from '@angular/core';
import { IpcService } from './ipc.service';

@Injectable({
    providedIn: 'root'
})
export class SecondaryWindowService {
    constructor(private readonly ipcService: IpcService) {}

    openWindow(url: string): Promise<number> {
        return this.ipcService.invoke('open-secondary-window', { url });
    }

    closeWindow(windowId: number): Promise<void> {
        return this.ipcService.invoke('close-secondary-window', windowId);
    }
}
