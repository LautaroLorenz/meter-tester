import { app, BrowserWindow, screen } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import database from './resources/database/database';
import abm from './commands/abm';
import essay from './commands/essay';
import history from './commands/history';
import machine from './resources/machine/machine';
import restart from './resources/restart/restart';
import virtualMachine from './resources/virtual-machine/virtual-machine';
import { APP_CONFIG } from './environment/environment';
import * as KnexLib from 'knex';
import backup from './resources/database/backup';
import secondaryWindow from './resources/secondary-window/secondary-window';

function registerIpc(knex: any) {
    database.register();
    abm.register(knex);
    essay.register(knex);
    history.register(knex);
    machine.register();
    backup.register(knex);
    restart.register();
    secondaryWindow.register();
}

let win: BrowserWindow | null = null;
let knex: KnexLib.Knex;
const args = process.argv.slice(1);
const serve = args.some((val) => val === '--serve');
const isDev = args.find((val) => val.includes('environment'))?.split('=')?.[1] === 'dev';

const environment = APP_CONFIG(isDev);

if (environment.virtualMachine) {
    virtualMachine.register();
    virtualMachine.observeSoftwareWrite(machine.onSoftwareWrite$);
    machine.setSerialPort(virtualMachine.getMockSerialPort());
} else {
    machine.createSearialPort().then((serialPort) => {
        if (!serialPort) {
            return;
        }
        machine.observeSoftwareWrite(machine.onSoftwareWrite$);
        machine.setSerialPort(serialPort);
    });
}

function createWindow(): BrowserWindow {
    const size = screen.getPrimaryDisplay().workAreaSize;

    // Create the browser window.
    win = new BrowserWindow({
        x: 0,
        y: 0,
        width: size.width,
        height: size.height,
        webPreferences: {
            nodeIntegration: true,
            allowRunningInsecureContent: serve,
            contextIsolation: false,
            devTools: environment.inspector
        }
    });
    win.setMenuBarVisibility(false);
    backup.setMainWindow(win);
    database.setMainWindow(win);

    let mainWindowUrl: string = '';
    if (serve) {
        const debug = require('electron-debug');
        debug();
        require('electron-reloader')(module);
        mainWindowUrl = 'http://localhost:4200';
    } else {
        // Path when running electron executable
        let pathIndex = './index.html';
        if (fs.existsSync(path.join(__dirname, '../dist/index.html'))) {
            // Path when running electron in local folder
            pathIndex = '../dist/index.html';
        }
        mainWindowUrl = new URL(path.join('file:', __dirname, pathIndex)).href;
    }

    knex = database.connect();
    win.loadURL(mainWindowUrl);
    registerIpc(knex);

    // Emitted when the window is closed.
    win.on('closed', () => {
        if (knex) {
            knex.destroy();
        }

        // Dereference the window object, usually you would store window
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        secondaryWindow.closeAllOpenedWindow();
        win = null;
    });

    return win;
}

try {
    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    // Added 400 ms to fix the black background issue while using transparent window. More detais at https://github.com/electron/electron/issues/15947
    app.on('ready', () => setTimeout(createWindow, 400));

    // Quit when all windows are closed.
    app.on('window-all-closed', () => {
        // On OS X it is common for applications and their menu bar
        // to stay active until the user quits explicitly with Cmd + Q
        if (process.platform !== 'darwin') {
            app.quit();
        }
    });

    app.on('activate', () => {
        // On OS X it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (win === null) {
            createWindow();
        }
    });
} catch (e) {
    // Catch Error
    // throw e;
}
