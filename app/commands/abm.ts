import { ipcMain } from 'electron';

export default {
  register: (knex: any) => {
    ipcMain.on('get-table', async ({ reply }, dbTableConnection) => {
      const { tableName, relations, conditions } = dbTableConnection;
      const relationsMap: any = {};
      const queryBuilder = knex(tableName).orderBy('id', 'desc');

      for (const condition of conditions) {
        const { kind, columnName, operator, value } = condition;
        if (kind === 'where') {
          queryBuilder.where(columnName, operator, value);
        }
        if (kind === 'andWhere') {
          queryBuilder.andWhere(columnName, operator, value);
        }
        if (kind === 'orWhere') {
          queryBuilder.orWhere(columnName, operator, value);
        }
      }

      const rows = await queryBuilder;
      for await (const relation of relations) {
        relationsMap[relation] = await knex(relation);
      }
      reply('get-table-reply', {
        tableNameReply: tableName,
        rows,
        relations: relationsMap,
      });
    });

    ipcMain.handle('get-table-row', async (_, { tableName, id }) => {
      const row = await knex(tableName).select().where('id', id);
      return row[0];
    });

    ipcMain.handle('delete-from-table', async (_, { tableName, ids }) => {
      const numberOfElementsDeleted = await knex(tableName)
        .delete()
        .whereIn('id', ids);
      return numberOfElementsDeleted;
    });

    ipcMain.handle('add-to-table', async (_, { tableName, element }) => {
      try {
        const newElementsIds = await knex(tableName).insert(element);
        return newElementsIds;
      } catch {
        return null;
      }
    });

    ipcMain.handle('edit-from-table', async (_, { tableName, element }) => {
      const { id } = element;
      const numberOfElementsUpdated = await knex(tableName)
        .update(element)
        .where('id', id);
      return numberOfElementsUpdated;
    });
  },
};
