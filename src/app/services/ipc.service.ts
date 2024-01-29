/* eslint-disable @typescript-eslint/no-unsafe-argument */ // FIXME
import { Injectable } from '@angular/core';
import { IpcRenderer } from 'electron';

@Injectable({
  providedIn: 'root',
})
export class IpcService {
  private readonly ipc: IpcRenderer;

  constructor() {
    if (!window.require) {
      console.warn('Electron IPC was not loaded');
    }

    this.ipc = window.require('electron').ipcRenderer;
  }

  public on(channel: string, listener: any): void {
    if (!this.ipc) {
      throw new Error('IpcRenderer not initialized');
    }
    this.ipc.on(channel, listener);
  }

  public once(channel: string, listener: any): void {
    if (!this.ipc) {
      throw new Error('IpcRenderer not initialized');
    }
    this.ipc.once(channel, listener);
  }

  public send(channel: string, ...args: any[]): void {
    if (!this.ipc) {
      throw new Error('IpcRenderer not initialized');
    }
    this.ipc.send(channel, ...args);
  }

  public sendSync(channel: string, ...args: any[]): void {
    if (!this.ipc) {
      throw new Error('IpcRenderer not initialized');
    }
    this.ipc.sendSync(channel, ...args);
  }

  public invoke(channel: string, ...args: any[]): Promise<any> {
    if (!this.ipc) {
      throw new Error('IpcRenderer not initialized');
    }
    return this.ipc.invoke(channel, ...args);
  }

  public removeAllListeners(channel: string): void {
    if (!this.ipc) {
      throw new Error('IpcRenderer not initialized');
    }
    this.ipc.removeAllListeners(channel);
  }
}
