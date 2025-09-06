import { Injectable, NgZone } from '@angular/core';
import { IpcService } from './ipc.service';

@Injectable({
    providedIn: 'root'
})
export class SecondaryWindowService {
    private readonly baseUrl = 'secondary-window/';

    constructor(
        private readonly ipcService: IpcService,
        private readonly ngZone: NgZone
    ) {}

    openWindow(url: string): Promise<number> {
        return this.ipcService.invoke('open-secondary-window', { url: this.formatUrl(url) });
    }

    closeWindow(windowId: number): Promise<void> {
        return this.ipcService.invoke('close-secondary-window', windowId);
    }

    closeWindowByUrl(url: string): Promise<void> {
        return this.ipcService.invoke('close-secondary-window', this.formatUrl(url));
    }

    onWindowReady(windowId: number, callback: any): void {
        this.ipcService.on(`secondary-window-id-${windowId}-is-ready`, callback);
    }

    isWindowReady(windowId: number): Promise<boolean> {
        return this.ipcService.invoke('is-secondary-window-ready', windowId);
    }

    isWindowReadyByUrl(url: string): Promise<boolean> {
        return this.ipcService.invoke('is-secondary-window-ready', this.formatUrl(url));
    }

    sendToWindow(windowId: number, args: any): void {
        this.ipcService.send(`from-main-to-window-id-${windowId}`, args);
    }

    setSecondaryWindowReady(): Promise<number> {
        return this.ipcService.invoke('set-secondary-window-ready');
    }

    getWindowIdByUrl(url: string): Promise<number> {
        return this.ipcService.invoke('get-secondary-window-id', this.formatUrl(url));
    }

    onMainWindowMessage(listener: any): void {
        this.ipcService.on('from-main-window', (_: any, args: any) => {
            this.ngZone.run(() => {
                listener(args);
            });
        });
    }

    private formatUrl(url: string): string {
        return `${this.baseUrl}${url}`;
    }
}
