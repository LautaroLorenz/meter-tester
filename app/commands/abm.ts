import { ipcMain } from 'electron';
import { Knex } from 'knex';
import * as util from 'util';

enum F_MatchMode {
  dateIs = 'dateIs',
  equals = 'equals',
  like = 'like',
}

type F_Operator = 'and' | 'or';

type FilterTypeBase<T> = {
  matchMode: F_MatchMode;
  operator: F_Operator;
  value: T;
};

interface F_DateIs extends FilterTypeBase<string> {
  matchMode: F_MatchMode.dateIs;
}

interface F_Equals extends FilterTypeBase<number> {
  matchMode: F_MatchMode.equals;
}
interface F_Like extends FilterTypeBase<string> {
  matchMode: F_MatchMode.like;
}

type FilterMetaData = F_DateIs | F_Equals | F_Like;

type TableName = string;

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

type Filters = Record<TableName, FilterMetaData | FilterMetaData[]>;

/**
 * Arma la parte de get table que tiene que ver con retornar las tablas relacionadas a la buscada (recursivamente)
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
 * Arma la parte la query de la búsqueda por texto genérico.
 */
function getTableSearchBuilder(
  queryBuilder: Knex.QueryBuilder,
  globalFilter: string,
  globalFilterColumns: string[]
) {
  queryBuilder.andWhereRaw(
    `CONCAT(${globalFilterColumns.join(',')}) COLLATE utf8_general_ci LIKE ?`,
    [`%${globalFilter}%`]
  );
}

/**
 * Arma la parte la query de los joins entre todas las ForeignTable (es recursiva para traer relacionadas de relacionadas)
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
 * Arma la parte la query del ordenamiento
 */
function getTableOrderBuilder(
  queryBuilder: Knex.QueryBuilder,
  sortField: string | string[],
  sortOrder: number
): void {
  if (Array.isArray(sortField)) {
    // ordenamiento por multiples columnas
    sortField.forEach((field) =>
      getTableOrderBuilder(queryBuilder, field, sortOrder)
    );
    return;
  }
  const orderDirection = sortOrder > 0 ? 'desc' : 'asc';
  queryBuilder.orderBy(sortField, orderDirection);
}

/**
 *  Arma la parte la query del filtrado por el usuario
 */
function applyFilter(
  queryBuilder: Knex.QueryBuilder,
  condition: FilterMetaData,
  tableNameProp: string
): void {
  switch (condition.matchMode) {
    case F_MatchMode.dateIs:
      if (condition.value === null) {
        return;
      }
      const dateValue = new Date(condition.value);
      // Configura la fecha al principio del día (00:00:00)
      const startDateValue = new Date(
        dateValue.getFullYear(),
        dateValue.getMonth(),
        dateValue.getDate(),
        0,
        0,
        0
      );
      // Configura la fecha al final del día (23:59:59)
      const endDateValue = new Date(
        dateValue.getFullYear(),
        dateValue.getMonth(),
        dateValue.getDate(),
        23,
        59,
        59
      );
      queryBuilder.andWhere(tableNameProp, '>=', startDateValue);
      queryBuilder.andWhere(tableNameProp, '<=', endDateValue);
      break;
    case F_MatchMode.equals:
      if (condition.value === null) {
        return;
      }
      queryBuilder.andWhere(tableNameProp, '=', condition.value);
      break;
    case F_MatchMode.like:
      if (condition.value === null) {
        return;
      }
      queryBuilder.andWhere(tableNameProp, 'LIKE', condition.value);
      break;
  }
}

function getTableFilterBuilder(
  queryBuilder: Knex.QueryBuilder,
  filters: Filters
): void {
  Object.entries(filters).forEach((conditions) => {
    const [tableNameProp, metaData] = conditions;
    if (Array.isArray(metaData)) {
      metaData.forEach((condition) => {
        applyFilter(queryBuilder, condition, tableNameProp);
      });
    } else {
      applyFilter(queryBuilder, metaData, tableNameProp);
    }
  });
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
            lazyLoadEvent.sortOrder
          );
        } else {
          queryBuilder.orderBy('id', 'desc');
        }

        // Búsqueda global
        if (!!lazyLoadEvent.globalFilter) {
          getTableSearchBuilder(
            queryBuilder,
            lazyLoadEvent.globalFilter,
            globalFilterColumns
          );
        }

        // Filtrado (por el usuario)
        if (!!lazyLoadEvent.filters) {
          getTableFilterBuilder(queryBuilder, lazyLoadEvent.filters);
        }
      } else {
        queryBuilder.orderBy('id', 'desc');
      }

      // Filtrado (condiciones harcodeadas por el desarrollador)
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

    ipcMain.handle(
      'add-to-table',
      async (_, { tableName, element, rawProperties }) => {
        try {
          // Propiedades JSON como string
          if (rawProperties.length > 0) {
            rawProperties.forEach((rawProperty: string) => {
              if (typeof element[rawProperty] !== 'object') {
                return;
              }
              element[rawProperty] = JSON.stringify(element[rawProperty]);
            });
          }

          const newElementsIds = await knex(tableName).insert(element);
          return newElementsIds;
        } catch {
          return null;
        }
      }
    );

    ipcMain.handle(
      'edit-from-table',
      async (_, { tableName, element, rawProperties }) => {
        const { id } = element;

        // Propiedades JSON como string
        if (rawProperties.length > 0) {
          rawProperties.forEach((rawProperty: string) => {
            if (typeof element[rawProperty] !== 'object') {
              return;
            }
            element[rawProperty] = JSON.stringify(element[rawProperty]);
          });
        }

        const numberOfElementsUpdated = await knex(tableName)
          .update(element)
          .where('id', id);
        return numberOfElementsUpdated;
      }
    );
  },
};
