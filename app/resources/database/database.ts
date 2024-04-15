import { ipcMain } from 'electron';
import * as KnexLib from 'knex';
import knexfile from './knexfile';
import { dataBasePath } from './databasePath';

let knex: KnexLib.Knex;
let created = false;
let updated = false;
let updatedError = false;

async function runSeedsFirstTime(knex: KnexLib.Knex) {
  // Verifica si la base de datos está vacía
  const isEmpty = await knex('meters')
    .count('* as count')
    .then((rows) => rows[0].count === 0);

  if (isEmpty) {
    // Si la base de datos está vacía, ejecuta los seeds
    knex.seed.run().then(() => {
      created = true;
    });
  }
}

export default {
  connect: () => {
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
      return response;
    });
  },
};
