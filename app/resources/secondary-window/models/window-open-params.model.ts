import { BrowserWindowConstructorOptions } from 'electron';

export interface WindowOpenParams {
    url: string;
    options?: BrowserWindowConstructorOptions;
}
