import { app, BrowserWindow, screen } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import database from './resources/database/database';
import knexFile from './resources/database/knexfile';
import abm from './commands/abm';
import essay from './commands/essay';
import virtualMachine from './resources/virtual-machine/virtual-machine';

function registerIpc(knex: any) {
  knexFile.register();
  abm.register(knex);
  essay.register(knex);
}

let win: BrowserWindow | null = null;
const args = process.argv.slice(1);
const serve = args.some((val) => val === '--serve');
const isDev =
  args.find((val) => val.includes('environment'))?.split('=')?.[1] === 'dev';
let APP_CONFIG: any;

// cuando estamos en el ambiente dev, podemos trabajar con el simulador
if (isDev) {
  import('../src/environments/environment.dev').then((environment) => {
    APP_CONFIG = environment.APP_CONFIG;
    if (APP_CONFIG.virtualMachine) {
      virtualMachine.register();
    } 
  });
} else {
  import('../src/environments/environment.prod').then((environment) => {
    APP_CONFIG = environment.APP_CONFIG;
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
    },
  });
  win.setMenuBarVisibility(false);

  let knex: any;
  if (serve) {
    const debug = require('electron-debug');
    debug();

    require('electron-reloader')(module);
    knex = database.connect({ isProduction: false });
    win.loadURL('http://localhost:4200');
  } else {
    // Path when running electron executable
    let pathIndex = './index.html';

    if (fs.existsSync(path.join(__dirname, '../dist/index.html'))) {
      // Path when running electron in local folder
      pathIndex = '../dist/index.html';
    }

    knex = database.connect({ isProduction: true });
    const url = new URL(path.join('file:', __dirname, pathIndex));
    win.loadURL(url.href);
  }

  registerIpc(knex);

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    virtualMachine.closeWindow();
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
