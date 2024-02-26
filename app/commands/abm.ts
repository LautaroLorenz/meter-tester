import { ipcMain } from 'electron';
import { ForeignTable } from '../../src/app/models/core/database.model';

function getForeignTableNameByProp(
  relations: ForeignTable[],
  property: string
): string {
  const relation = relations.find(
    ({ propertyName }: ForeignTable) => propertyName === property
  );
  return relation?.tableName ?? '';
}

export default {
  register: (knex: any) => {
    ipcMain.on('get-table', async ({ reply }, dbTableConnection) => {
      const {
        tableName,
        relations,
        conditions,
        rawProperties,
        lazyLoadEvent,
        globalFilterColumns,
      } = dbTableConnection;
      const relationsMap: any = {};
      const queryBuilder = knex(tableName).select(`${tableName}.*`);

      if (lazyLoadEvent) {
        if (!!lazyLoadEvent.sortField) {
          const sortOrder = lazyLoadEvent.sortOrder > 0 ? 'desc' : 'asc';
          if (lazyLoadEvent.sortField.includes('foreign')) {
            const foreignSortFieldParts = lazyLoadEvent.sortField.split('.');
            const foreignSortFieldPropertyName = foreignSortFieldParts[1];
            const foreignTableName = getForeignTableNameByProp(
              relations,
              foreignSortFieldPropertyName
            );
            const foreignTableColumn = foreignSortFieldParts[2];
            queryBuilder.orderBy(
              `${foreignTableName}.${foreignTableColumn}`,
              sortOrder
            );
          } else {
            queryBuilder.orderBy(lazyLoadEvent.sortField, sortOrder);
          }
        } else {
          queryBuilder.orderBy('id', 'desc');
        }

        if (!!lazyLoadEvent.globalFilter) {
          const columns: string[] = globalFilterColumns.map(
            (filterColumn: string) => {
              if (filterColumn.includes('foreign')) {
                const foreignFieldParts = filterColumn.split('.');
                const foreignFieldPropertyName = foreignFieldParts[1];
                const foreignTableName = getForeignTableNameByProp(
                  relations,
                  foreignFieldPropertyName
                );
                const foreignTableColumn = foreignFieldParts[2];
                return `${foreignTableName}.${foreignTableColumn}`;
              } else {
                return `${tableName}.${filterColumn}`;
              }
            }
          );

          queryBuilder.andWhereRaw(
            `CONCAT(${columns.join(',')}) COLLATE utf8_general_ci LIKE ?`,
            [`%${lazyLoadEvent.globalFilter}%`]
          );
        }
      } else {
        queryBuilder.orderBy('id', 'desc');
      }

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

      for (let i = 0; i < relations?.length; i++) {
        const relation: ForeignTable = relations[i];
        queryBuilder.join(
          relation.tableName,
          `${tableName}.${relation.propertyName}_id`,
          `${relation.tableName}.id`
        );
      }

      const totalRecordsQueryBuilder = queryBuilder.clone();
      if (lazyLoadEvent) {
        if (!!lazyLoadEvent.rows) {
          queryBuilder.limit(lazyLoadEvent.rows);
        }
        if (!!lazyLoadEvent.first) {
          queryBuilder.offset(lazyLoadEvent.first);
        }
      }
      let rows = await queryBuilder;
      const { totalRecords } = (
        await totalRecordsQueryBuilder.count('*', { as: 'totalRecords' })
      )[0];

      if (rawProperties.length > 0) {
        rows = rows.map((row: any) => {
          rawProperties.forEach((rawProperty: string) => {
            row[rawProperty] = JSON.parse(row[rawProperty]);
          });
          return { ...row };
        });
      }
      for await (const relation of relations) {
        const relationTableName = relation.tableName;
        relationsMap[relationTableName] = await knex(relationTableName);
      }
      reply('get-table-reply', {
        tableNameReply: tableName,
        rows,
        relations: relationsMap,
        totalRecords,
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
