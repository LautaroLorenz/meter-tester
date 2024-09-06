import { ipcMain, dialog, BrowserWindow } from 'electron';
import * as KnexLib from 'knex';
import knexfile from './knexfile';
import { dataBasePath } from './databasePath';
import * as Store from 'electron-store';
const store = new Store();

let knex: KnexLib.Knex;
let created = false;
let updated = false;
let updatedError = false;
let mainWindow: BrowserWindow;

async function runSeedsFirstTime(knex: KnexLib.Knex) {
  // Verifica si la base de datos está vacía
  const isEmpty = await knex('steps')
    .count('* as count')
    .then((rows) => rows[0].count === 0);

  if (isEmpty) {
    // Si la base de datos está vacía, ejecuta los seeds
    knex.seed.run().then(() => {
      created = true;
    });
  }
}

function doConnection() {
  knex = require('knex')(knexfile);

  // Actualizar base de datos
  knex.migrate
    .latest()
    .then((migrations) => {
      if (migrations?.[1]?.length > 0) {
        console.log(migrations);
        updated = true;
      }

      // Run seeds first time
      runSeedsFirstTime(knex);
    })
    .catch(() => {
      updatedError = true;
    });

  return knex;
}

export default {
  connect: () => {
    return doConnection();
  },
  register: () => {
    ipcMain.handle('get-database-path', async () => {
      return {
        dataBasePath,
      };
    });
    ipcMain.handle('get-database-connection-status', async () => {
      let status;
      await knex
        .raw('select 1+1 as result')
        .then(() => {
          status = true;
        })
        .catch(() => {
          status = false;
        });

      const response = { status, created, updated, updatedError, location: '' };
      if (status) {
        response.location = dataBasePath;
      }

      // una vez enviado el estado, volvemos los flags a cero
      setTimeout(() => {
        created = false;
        updated = false;
        updatedError = false;
      }, 100);

      return response;
    });
    // seleccionar la base de datos a la que se realizará la conexión
    ipcMain.handle('change-connection-path', async () => {
      if (!mainWindow) {
        return null;
      }
      const result = await dialog.showOpenDialog(mainWindow, {
        title: 'Seleccionar archivo de base de datos',
        buttonLabel: 'Seleccionar',
        properties: ['openFile'],
        filters: [{ name: 'Base de datos', extensions: ['db'] }]
      });

      if (result.canceled || result.filePaths.length === 0) {
        return { success: false, message: 'No file selected' };
      }

      const dataBasePath = result.filePaths[0];

      try {
        // Reconectar con la nueva base de datos
        knexfile.connection = dataBasePath;
        doConnection();
        // Hacer una query para ver si la base de datos está ok
        const isEmpty = await knex('steps')
          .count('* as count')
          .then((rows) => rows[0].count === 0);
        if (isEmpty) {
          return { success: false, message: 'Connection failed: Not valid database' };
        }
        // Guardar el path de conexión en el store
        store.set('dbDirectory', dataBasePath);
        return { success: true, message: 'Database connected successfully' };
      } catch (error: any) {
        return { success: false, message: `Connection failed: ${error?.message}` };
      }
    });
    // Verificar si el usuario estableció una ruta de conexión personalizada
    ipcMain.handle('check-custom-connection-path', async () => {
      const customDataBasePath = store.get('dbDirectory') as string ?? null;
      return customDataBasePath;
    });
  },
  setMainWindow: (mainWindowParam: BrowserWindow) => {
    mainWindow = mainWindowParam;
  }
};
