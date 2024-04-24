"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const filters_1 = require("./filters");
/**
 * Arma la parte de get table que tiene que ver con retornar las tablas relacionadas a la buscada (recursivamente)
 */
function getRelatedTables(knex, relationsMap, relations) {
    var _a, relations_1, relations_1_1;
    var _b, e_1, _c, _d;
    var _e;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            for (_a = true, relations_1 = __asyncValues(relations); relations_1_1 = yield relations_1.next(), _b = relations_1_1.done, !_b;) {
                _d = relations_1_1.value;
                _a = false;
                try {
                    const relation = _d;
                    const relationTableName = relation.tableName;
                    relationsMap[relationTableName] = yield knex(relationTableName);
                    if (!!((_e = relation.foreignTables) === null || _e === void 0 ? void 0 : _e.length)) {
                        yield getRelatedTables(knex, relationsMap, relation.foreignTables);
                    }
                }
                finally {
                    _a = true;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (!_a && !_b && (_c = relations_1.return)) yield _c.call(relations_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    });
}
/**
 * Arma la parte la query de la búsqueda por texto genérico.
 */
function getTableSearchBuilder(queryBuilder, globalFilter, globalFilterColumns) {
    queryBuilder.andWhereRaw(`CONCAT(${globalFilterColumns.join(',')}) COLLATE utf8_general_ci LIKE ?`, [`%${globalFilter}%`]);
}
/**
 * Arma la parte la query de los joins entre todas las ForeignTable (es recursiva para traer relacionadas de relacionadas)
 */
function joinTables(relations, tableName) {
    let joins = [];
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
function getJoinTablesBuilder(queryBuilder, relations, tableName) {
    joinTables(relations, tableName).forEach(({ tableName, leftProp, rightProp }) => queryBuilder.join(tableName, leftProp, rightProp));
}
/**
 * Arma la parte la query del ordenamiento
 */
function getTableOrderBuilder(queryBuilder, sortField, sortOrder) {
    if (Array.isArray(sortField)) {
        // ordenamiento por multiples columnas
        sortField.forEach((field) => getTableOrderBuilder(queryBuilder, field, sortOrder));
        return;
    }
    const orderDirection = sortOrder > 0 ? 'desc' : 'asc';
    queryBuilder.orderBy(sortField, orderDirection);
}
/**
 * Arma la parte la query de filtros
 */
function getTableFilterBuilder(queryBuilder, filters) {
    queryBuilder.where((filtersBuilder) => {
        Object.keys(filters).forEach((tableNameProp) => {
            const metaData = filters[tableNameProp];
            const groupConditionsMetaData = !Array.isArray(metaData)
                ? [metaData]
                : metaData;
            const groupLogicOperator = groupConditionsMetaData[0].operator;
            // Los filtros están concatenados con "and" por eso usamos "andWhere"
            // Ejemplo "nombre" and "mascota" and "fecha"
            filtersBuilder.andWhere((filterBuilder) => {
                // Cada filtro tiene varias condiciones que pueden estar concatenadas con "and" o con "or".
                // Ejemplo1 "mascotaNombre=Chucky or mascotaNombre=Trompy or mascotaNombre=Valky".
                // Ejemplo2 "fechaBefore='29/03/2023' and fechaAfter='30/04/2023'".
                // Por eso el operador interno de cada filtro puede ser "andWhere" o "orWhere".
                // Se toma el operador que trae la primera condición de filtro.
                filterBuilder.where((conditionsBuilder) => groupConditionsMetaData.forEach((groupConditionMetadata) => {
                    const filterConditions = (0, filters_1.getFilterConditions)(groupConditionMetadata);
                    // Cada condicion de un filtro, en realidad puede ser un grupo de condiciones concatenadas con un operador
                    // Ejemplo cuando es "dateIs" se crean dos condiciones para principio y final del dia y las une con "and".
                    if (!filterConditions) {
                        return;
                    }
                    if (groupLogicOperator === filters_1.F_LogicOperator.and) {
                        // Verificamos si la condición es simple
                        if (!('logicOperator' in filterConditions)) {
                            conditionsBuilder.andWhere(tableNameProp, filterConditions.comparisonOperator, filterConditions.value);
                        }
                        else {
                            // si la condición es compuesta
                            const { conditions, logicOperator } = filterConditions;
                            if (logicOperator === filters_1.F_LogicOperator.and) {
                                conditionsBuilder.andWhere((conditionBuilder) => {
                                    conditions.forEach((condition) => {
                                        conditionBuilder.andWhere(tableNameProp, condition.comparisonOperator, condition.value);
                                    });
                                });
                            }
                            else {
                                conditionsBuilder.andWhere((conditionBuilder) => {
                                    conditions.forEach((condition) => {
                                        conditionBuilder.orWhere(tableNameProp, condition.comparisonOperator, condition.value);
                                    });
                                });
                            }
                        }
                    }
                    else {
                        // Verificamos si la condición es simple
                        if (!('logicOperator' in filterConditions)) {
                            conditionsBuilder.orWhere(tableNameProp, filterConditions.comparisonOperator, filterConditions.value);
                        }
                        else {
                            // si la condición es compuesta
                            const { conditions, logicOperator } = filterConditions;
                            if (logicOperator === filters_1.F_LogicOperator.and) {
                                conditionsBuilder.orWhere((conditionBuilder) => {
                                    conditions.forEach((condition) => {
                                        conditionBuilder.andWhere(tableNameProp, condition.comparisonOperator, condition.value);
                                    });
                                });
                            }
                            else {
                                conditionsBuilder.orWhere((conditionBuilder) => {
                                    conditions.forEach((condition) => {
                                        conditionBuilder.orWhere(tableNameProp, condition.comparisonOperator, condition.value);
                                    });
                                });
                            }
                        }
                    }
                }));
            });
        });
    });
}
exports.default = {
    register: (knex) => {
        electron_1.ipcMain.on('get-table', ({ reply }, dbTableConnection) => __awaiter(void 0, void 0, void 0, function* () {
            const { tableName, relations, conditions, rawProperties, lazyLoadEvent, globalFilterColumns, } = dbTableConnection;
            const relationsMap = {};
            const queryBuilder = knex(tableName).select(`${tableName}.*`);
            if (lazyLoadEvent) {
                // Ordenamiento
                if (!!lazyLoadEvent.sortField) {
                    getTableOrderBuilder(queryBuilder, lazyLoadEvent.sortField, lazyLoadEvent.sortOrder);
                }
                else {
                    queryBuilder.orderBy('id', 'desc');
                }
                // Búsqueda global
                if (!!lazyLoadEvent.globalFilter) {
                    getTableSearchBuilder(queryBuilder, lazyLoadEvent.globalFilter, globalFilterColumns);
                }
                // Filtrado (por el usuario)
                if (!!lazyLoadEvent.filters) {
                    getTableFilterBuilder(queryBuilder, lazyLoadEvent.filters);
                }
            }
            else {
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
            let rows = yield queryBuilder;
            const { totalRecords } = (yield totalRecordsQueryBuilder.count('*', { as: 'totalRecords' }))[0];
            // Propiedades JSON como string
            if (rawProperties.length > 0) {
                rows = rows.map((row) => {
                    rawProperties.forEach((rawProperty) => {
                        row[rawProperty] = JSON.parse(row[rawProperty]);
                    });
                    return Object.assign({}, row);
                });
            }
            // Tablas relacionadas (recursivo)
            yield getRelatedTables(knex, relationsMap, relations);
            reply('get-table-reply', {
                tableNameReply: tableName,
                rows,
                relations: relationsMap,
                totalRecords,
            });
        }));
        electron_1.ipcMain.handle('get-table-row', (_, { tableName, id }) => __awaiter(void 0, void 0, void 0, function* () {
            const row = yield knex(tableName).select().where('id', id);
            return row[0];
        }));
        electron_1.ipcMain.handle('delete-from-table', (_, { tableName, ids }) => __awaiter(void 0, void 0, void 0, function* () {
            const numberOfElementsDeleted = yield knex(tableName)
                .delete()
                .whereIn('id', ids);
            return numberOfElementsDeleted;
        }));
        electron_1.ipcMain.handle('add-to-table', (_, { tableName, element, rawProperties }) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                // Propiedades JSON como string
                if (rawProperties.length > 0) {
                    rawProperties.forEach((rawProperty) => {
                        if (typeof element[rawProperty] !== 'object') {
                            return;
                        }
                        element[rawProperty] = JSON.stringify(element[rawProperty]);
                    });
                }
                const newElementsIds = yield knex(tableName).insert(element);
                return newElementsIds;
            }
            catch (_a) {
                return null;
            }
        }));
        electron_1.ipcMain.handle('edit-from-table', (_, { tableName, element, rawProperties }) => __awaiter(void 0, void 0, void 0, function* () {
            const { id } = element;
            // Propiedades JSON como string
            if (rawProperties.length > 0) {
                rawProperties.forEach((rawProperty) => {
                    if (typeof element[rawProperty] !== 'object') {
                        return;
                    }
                    element[rawProperty] = JSON.stringify(element[rawProperty]);
                });
            }
            const numberOfElementsUpdated = yield knex(tableName)
                .update(element)
                .where('id', id);
            return numberOfElementsUpdated;
        }));
    },
};
//# sourceMappingURL=abm.js.map