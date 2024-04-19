import { ipcMain } from 'electron';
import { Knex } from 'knex';
import * as util from 'util';

type ForeignTable = {
  tableName: string;
  foreignKey: string;
  propertyName: string;
  foreignTables?: ForeignTable[];
};

type JoinTable = {
  tableName: string;
  leftProp: string;
  rightProp: string;
};

function getForeignTableNameByProp(relations: any[], property: string): string {
  const relation = relations.find(
    ({ propertyName }: any) => propertyName === property
  );
  return relation?.tableName ?? '';
}

/**
 * Arma la parte de get table que tiene que ver con retornar las tablas relacioandas a la buscada
 */
async function getRelatedTables(
  knex: Knex,
  relationsMap: Record<string, any>,
  relations: any[]
): Promise<void> {
  for await (const relation of relations) {
    const relationTableName = relation.tableName;
    relationsMap[relationTableName] = await knex(relationTableName);
    if (!!relation.foreignTables?.length) {
      await getRelatedTables(knex, relationsMap, relation.foreignTables);
    }
  }
}

/**
 * Arma la parte de get table que tiene que ver con la búsqueda por texto genérico.
 */
function getColumns(
  tableName: string,
  foreignTables: ForeignTable[],
  globalFilterColumns: string[]
): string[] {
  const output: string[] = [];

  const findForeignTable = (
    propertyName: string,
    foreignTables: ForeignTable[]
  ): ForeignTable | undefined => {
    for (const table of foreignTables) {
      if (table.propertyName === propertyName) {
        return table;
      }
      if (table.foreignTables) {
        const foundTable = findForeignTable(propertyName, table.foreignTables);
        if (foundTable) {
          return foundTable;
        }
      }
    }
  };

  for (const column of globalFilterColumns) {
    if (!column.includes('foreign')) {
      output.push(`${tableName}.${column}`);
    } else {
      const parts = column.split('.');
      let currentTables = foreignTables;
      let currentTable: ForeignTable | undefined;

      for (let i = 1; i < parts.length; i += 2) {
        currentTable = findForeignTable(parts[i], currentTables);
        if (currentTable && currentTable.foreignTables) {
          currentTables = currentTable.foreignTables;
        }
      }

      if (currentTable) {
        output.push(`${currentTable.tableName}.${parts[parts.length - 1]}`);
      }
    }
  }

  return output;
}
function getTableSearchBuilder(
  queryBuilder: Knex.QueryBuilder,
  globalFilter: string,
  globalFilterColumns: string[],
  relations: ForeignTable[],
  tableName: string
) {
  const columns: string[] = getColumns(
    tableName,
    relations,
    globalFilterColumns
  );
  queryBuilder.andWhereRaw(
    `CONCAT(${columns.join(',')}) COLLATE utf8_general_ci LIKE ?`,
    [`%${globalFilter}%`]
  );
}

/**
 * Genera la parte de la query de los join entre la tabla y las relacionadas
 */
function joinTables(relations: ForeignTable[], tableName: string): JoinTable[] {
  let joins: JoinTable[] = [];

  for (const table of relations) {
    const leftProp = `${tableName}.${table.foreignKey}`;
    const rightProp = `${table.tableName}.id`;

    joins.push({
      tableName: table.tableName,
      leftProp,
      rightProp,
    });

    if (table.foreignTables) {
      joins = joins.concat(joinTables(table.foreignTables, table.tableName));
    }
  }

  return joins;
}
function getJoinTablesBuilder(
  queryBuilder: Knex.QueryBuilder,
  relations: ForeignTable[],
  tableName: string
) {
  joinTables(relations, tableName).forEach(
    ({ tableName, leftProp, rightProp }) =>
      queryBuilder.join(tableName, leftProp, rightProp)
  );
}

/**
 * Generar la parte del ordenamiento del builder
 */
function findForeignTable(propertyName: string, foreignTables: any[]): any {
  for (const table of foreignTables) {
    if (table.propertyName === propertyName) {
      return table;
    }
    if (table.foreignTables) {
      const foundTable = findForeignTable(propertyName, table.foreignTables);
      if (foundTable) {
        return foundTable;
      }
    }
  }
  return null;
}
function getTableOrderBuilder(
  queryBuilder: Knex.QueryBuilder,
  sortField: string,
  sortOrder: number,
  relations: ForeignTable[],
  tableName: string
): void {
  const orderDirection = sortOrder > 0 ? 'desc' : 'asc';
  const parts = sortField.split('.');
  let currentTable = tableName;
  let tableColumnOrder = '';

  for (let i = 0; i < parts.length; i++) {
    if (parts[i] === 'foreign') {
      const nextTable = parts[i + 1];
      const foreignTable = findForeignTable(nextTable, relations);
      if (foreignTable) {
        currentTable = foreignTable.tableName;
        i++; // Skip the next part because we've already processed it
      }
    } else {
      tableColumnOrder = `${currentTable}.${parts[i]}`;
    }
  }
  queryBuilder.orderBy(tableColumnOrder, orderDirection);
}

export default {
  register: (knex: Knex) => {
    ipcMain.on('get-table', async ({ reply }, dbTableConnection) => {
      const {
        tableName,
        relations,
        conditions,
        rawProperties,
        lazyLoadEvent,
        globalFilterColumns,
      } = dbTableConnection;
      const relationsMap: Record<string, any> = {};
      const queryBuilder = knex(tableName).select(`${tableName}.*`);

      if (lazyLoadEvent) {
        // Ordenamiento
        if (!!lazyLoadEvent.sortField) {
          getTableOrderBuilder(
            queryBuilder,
            lazyLoadEvent.sortField,
            lazyLoadEvent.sortOrder,
            relations,
            tableName
          );
        } else {
          queryBuilder.orderBy('id', 'desc');
        }

        // Búsqueda global
        if (!!lazyLoadEvent.globalFilter) {
          getTableSearchBuilder(
            queryBuilder,
            lazyLoadEvent.globalFilter,
            globalFilterColumns,
            relations,
            tableName
          );
        }
      } else {
        queryBuilder.orderBy('id', 'desc');
      }

      // Filtrado
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

      // Joins de tablas relacionadas
      getJoinTablesBuilder(queryBuilder, relations, tableName);

      // Paginado
      const totalRecordsQueryBuilder = queryBuilder.clone();
      if (lazyLoadEvent) {
        if (!!lazyLoadEvent.rows) {
          queryBuilder.limit(lazyLoadEvent.rows);
        }
        if (!!lazyLoadEvent.first) {
          queryBuilder.offset(lazyLoadEvent.first);
        }
      }

      // Generación de la respuesta
      let rows = await queryBuilder;
      const { totalRecords } = (
        await totalRecordsQueryBuilder.count('*', { as: 'totalRecords' })
      )[0];

      // Propiedades JSON como string
      if (rawProperties.length > 0) {
        rows = rows.map((row: any) => {
          rawProperties.forEach((rawProperty: string) => {
            row[rawProperty] = JSON.parse(row[rawProperty]);
          });
          return { ...row };
        });
      }

      // Tablas relacionadas (recursivo)
      await getRelatedTables(knex, relationsMap, relations);

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
