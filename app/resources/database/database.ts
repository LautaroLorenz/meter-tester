import { ipcMain, app } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as KnexLib from 'knex';

let knex: KnexLib.Knex;

// Path de la base de datos en el directorio de datos del usuario
const userDataDir = app.getPath('userData');
const dataBaseName = 'database.db';
const dataBasePath = path.join(userDataDir, dataBaseName);

const config = {
  client: 'sqlite3',
  connection: dataBasePath,
  useNullAsDefault: true,
  migrations: {
    // Will create your migrations in the data folder automatically
    directory: path.join(__dirname, './migrations'),
  },
  seeds: {
    // Will create your seeds in the data folder automatically
    directory: path.join(__dirname, './seeds'),
  },
  pool: {
    // activate foreign keys check
    afterCreate: (conn: any, cb: any) =>
      conn.run('PRAGMA foreign_keys = ON', cb),
  },
};

function createDataBase(knex: KnexLib.Knex): void {
  knex.migrate
    .latest()
    .then(() => knex.seed.run())
    .then(() => {
      console.log('Base de datos creada y migraciones/seeds ejecutados');
    })
    .catch((error) => {
      console.error(`Error al crear la base de datos: ${error}`);
    });
}

export default {
  connect: () => {
    knex = require('knex')(config);

    // crear base de datos si no existe
    if (!fs.existsSync(dataBasePath)) {
      createDataBase(knex);
    }

    return knex;
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

      return { status };
    });
  },
};
