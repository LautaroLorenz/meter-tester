import { Injectable, NgZone } from '@angular/core';
import { IpcService } from './ipc.service';

@Injectable({
    providedIn: 'root'
})
export class SecondaryWindowService {
    constructor(private readonly ipcService: IpcService, private readonly ngZone: NgZone) {}

    openWindow(url: string): Promise<number> {
        return this.ipcService.invoke('open-secondary-window', { url: `secondary-window/${url}` });
    }

    closeWindow(windowId: number): Promise<void> {
        return this.ipcService.invoke('close-secondary-window', windowId);
    }

    sendToWindow(windowId: number, args: any): void {
        this.ipcService.send(`from-main-to-window-id-${windowId}`, args);
    }

    getWindowId(): Promise<number> {
        return this.ipcService.invoke('get-secondary-window-id');
    }

    onMainWindowMessage(listener: any): void {
        this.ipcService.on('from-main-window', (_: any, args: any) => {
            this.ngZone.run(() => {
                listener(args);
            });
        });
    }
}
