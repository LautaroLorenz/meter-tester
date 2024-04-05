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

async function runSeedsFirstTime(knex: KnexLib.Knex) {
  // Verifica si la base de datos está vacía
  const isEmpty = await knex('meters')
    .count('* as count')
    .then((rows) => rows[0].count === 0);

  if (isEmpty) {
    // Si la base de datos está vacía, ejecuta los seeds
    knex.seed.run();
  }
}

export default {
  connect: () => {
    knex = require('knex')(config);

    // Actualizar base de datos
    knex.migrate.latest().then(() => {
      // Run seeds first time
      runSeedsFirstTime(knex);
    });

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
