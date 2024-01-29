import { ipcMain } from 'electron';
const path = require('path');

function getDatabasePath(isProduction: boolean): string {
  const separator = path.sep;
  if (isProduction) {
    return `${__dirname}${separator}database.db`.replace(
      `${separator}app.asar${separator}resources${separator}database`,
      ''
    );
  } else {
    return `${__dirname}${separator}..${separator}..${separator}..${separator}src${separator}assets${separator}database.db`;
  }
}

const developmentPath = getDatabasePath(false);
const productionPath = getDatabasePath(true);

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
export default {
  register: () => {
    ipcMain.handle('get-database-path', async () => {
      return {
        developmentPath,
        productionPath,
      };
    });
  },
  development: {
    client: 'sqlite3',
    connection: developmentPath,
    useNullAsDefault: true,
    migrations: {
      // Will create your migrations in the data folder automatically
      directory: `./migrations`,
    },
    seeds: {
      // Will create your seeds in the data folder automatically
      directory: `./seeds`,
    },
    pool: {
      // activate foreign keys check
      afterCreate: (conn: any, cb: any) =>
        conn.run('PRAGMA foreign_keys = ON', cb),
    },
  },
  production: {
    client: 'sqlite3',
    connection: productionPath,
    useNullAsDefault: true,
    migrations: {
      // Will create your migrations in the data folder automatically
      directory: `./migrations`,
    },
    seeds: {
      // Will create your seeds in the data folder automatically
      directory: `./seeds`,
    },
    pool: {
      // activate foreign keys check
      afterCreate: (conn: any, cb: any) =>
        conn.run('PRAGMA foreign_keys = ON', cb),
    },
  },
};
