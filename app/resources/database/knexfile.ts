import * as path from 'path';
import { dataBasePath } from './databasePath';

export default {
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
