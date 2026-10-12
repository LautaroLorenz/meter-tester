import { app, BrowserWindow, screen, session } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { pathToFileURL } from 'url';
import database from './resources/database/database';
import abm from './commands/abm';
import essay from './commands/essay';
import history from './commands/history';
import clientSettings from './commands/client-settings';
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
    clientSettings.register();
    machine.register();
    backup.register(knex);
    restart.register();
    secondaryWindow.register();
}

let win: BrowserWindow | null = null;
let knex: KnexLib.Knex;
const args = process.argv.slice(1);
const serve = args.some((val) => val === '--serve');
const environmentName = args.find((val) => val.includes('environment'))?.split('=')?.[1];

const environment = APP_CONFIG(environmentName);
// en e2e las ventanas van ocultas, salvo que el test pida verlas (playwright --headed, graba video)
const hideWindows = !!environment.e2e && !args.includes('--e2e-headed');
// en e2e cada cliente se compila en su carpeta (dist-e2e/<cliente>) y el test elige cuál cargar
const e2eDist = environment.e2e ? args.find((val) => val.startsWith('--e2e-dist='))?.split('=')[1] : undefined;

if (environment.e2e && !environment.virtualMachine) {
    throw new Error('Modo e2e sin máquina virtual: no se permite abrir el puerto serie real');
}

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
        show: !hideWindows,
        webPreferences: {
            nodeIntegration: true,
            allowRunningInsecureContent: serve,
            contextIsolation: false,
            devTools: environment.inspector
        }
    });
    win.setMenuBarVisibility(false);
    if (win.isMaximizable() && !environment.e2e) win.maximize();
    if (environment.e2e) {
        // PDF y Excel se guardan sin diálogo dentro de userData (temporal en los tests)
        const downloadsDir = path.join(app.getPath('userData'), 'downloads');
        session.defaultSession.on('will-download', (_, item) => {
            item.setSavePath(path.join(downloadsDir, item.getFilename()));
        });
    }
    backup.setMainWindow(win);
    database.setMainWindow(win);
    secondaryWindow.setMainWindow(win);

    let mainWindowUrl: string = '';
    if (serve) {
        const debug = require('electron-debug');
        debug();
        require('electron-reloader')(module);
        mainWindowUrl = 'http://localhost:4200/';
    } else {
        // Path when running electron executable
        let pathIndex = './index.html';
        if (fs.existsSync(path.join(__dirname, '../dist/index.html'))) {
            // Path when running electron in local folder
            pathIndex = '../dist/index.html';
        }
        mainWindowUrl = new URL(path.join('file:', __dirname, pathIndex)).href;
        if (e2eDist) {
            mainWindowUrl = pathToFileURL(path.join(e2eDist, 'index.html')).href;
        }
    }
    mainWindowUrl += '#';

    knex = database.connect();
    win.loadURL(mainWindowUrl);

    secondaryWindow.setConfig({
        baseUrl: mainWindowUrl,
        inspector: environment.inspector,
        hidden: hideWindows
    });
    registerIpc(knex);

    // Abrir inspector una vez que la URL cargó completamente
    if (environment.inspector) {
        win.webContents.on('did-finish-load', () => {
            win?.webContents.openDevTools({ mode: 'right' });
        });
    }

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
