import { ipcMain } from 'electron';
const path = require('path');

let _isProduction: boolean;

function getDatabasePath(): string {
  console.log('get path', _isProduction);
  const separator = path.sep;
  let databasePath: string;
  if (_isProduction) {
    databasePath = `${__dirname}${separator}database.db`.replace(
      `${separator}app.asar${separator}resources${separator}database`,
      ''
    );
  } else {
    databasePath = `${__dirname}${separator}..${separator}..${separator}..${separator}src${separator}assets${separator}database.db`;
  }

  return databasePath;
}

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
export default {
  setIsProduction: (isProduction: boolean) => {
    _isProduction = isProduction;
  },
  register: () => {
    ipcMain.handle('get-database-path', async () => {
      return getDatabasePath();
    });
  },
  development: {
    client: 'sqlite3',
    connection: getDatabasePath(),
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
    connection: getDatabasePath(),
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
