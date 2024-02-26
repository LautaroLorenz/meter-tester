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
function getForeignTableNameByProp(relations, property) {
    var _a;
    const relation = relations.find(({ propertyName }) => propertyName === property);
    return (_a = relation === null || relation === void 0 ? void 0 : relation.tableName) !== null && _a !== void 0 ? _a : '';
}
exports.default = {
    register: (knex) => {
        electron_1.ipcMain.on('get-table', ({ reply }, dbTableConnection) => __awaiter(void 0, void 0, void 0, function* () {
            var _a, e_1, _b, _c;
            const { tableName, relations, conditions, rawProperties, lazyLoadEvent, globalFilterColumns, } = dbTableConnection;
            const relationsMap = {};
            const queryBuilder = knex(tableName).select(`${tableName}.*`);
            if (lazyLoadEvent) {
                if (!!lazyLoadEvent.sortField) {
                    const sortOrder = lazyLoadEvent.sortOrder > 0 ? 'desc' : 'asc';
                    if (lazyLoadEvent.sortField.includes('foreign')) {
                        const foreignSortFieldParts = lazyLoadEvent.sortField.split('.');
                        const foreignSortFieldPropertyName = foreignSortFieldParts[1];
                        const foreignTableName = getForeignTableNameByProp(relations, foreignSortFieldPropertyName);
                        const foreignTableColumn = foreignSortFieldParts[2];
                        queryBuilder.orderBy(`${foreignTableName}.${foreignTableColumn}`, sortOrder);
                    }
                    else {
                        queryBuilder.orderBy(lazyLoadEvent.sortField, sortOrder);
                    }
                }
                else {
                    queryBuilder.orderBy('id', 'desc');
                }
                if (!!lazyLoadEvent.globalFilter) {
                    const columns = globalFilterColumns.map((filterColumn) => {
                        if (filterColumn.includes('foreign')) {
                            const foreignFieldParts = filterColumn.split('.');
                            const foreignFieldPropertyName = foreignFieldParts[1];
                            const foreignTableName = getForeignTableNameByProp(relations, foreignFieldPropertyName);
                            const foreignTableColumn = foreignFieldParts[2];
                            return `${foreignTableName}.${foreignTableColumn}`;
                        }
                        else {
                            return `${tableName}.${filterColumn}`;
                        }
                    });
                    queryBuilder.andWhereRaw(`CONCAT(${columns.join(',')}) COLLATE utf8_general_ci LIKE ?`, [`%${lazyLoadEvent.globalFilter}%`]);
                }
            }
            else {
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
            for (let i = 0; i < (relations === null || relations === void 0 ? void 0 : relations.length); i++) {
                const relation = relations[i];
                queryBuilder.join(relation.tableName, `${tableName}.${relation.propertyName}_id`, `${relation.tableName}.id`);
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
            let rows = yield queryBuilder;
            const { totalRecords } = (yield totalRecordsQueryBuilder.count('*', { as: 'totalRecords' }))[0];
            if (rawProperties.length > 0) {
                rows = rows.map((row) => {
                    rawProperties.forEach((rawProperty) => {
                        row[rawProperty] = JSON.parse(row[rawProperty]);
                    });
                    return Object.assign({}, row);
                });
            }
            try {
                for (var _d = true, relations_1 = __asyncValues(relations), relations_1_1; relations_1_1 = yield relations_1.next(), _a = relations_1_1.done, !_a;) {
                    _c = relations_1_1.value;
                    _d = false;
                    try {
                        const relation = _c;
                        const relationTableName = relation.tableName;
                        relationsMap[relationTableName] = yield knex(relationTableName);
                    }
                    finally {
                        _d = true;
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = relations_1.return)) yield _b.call(relations_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
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
        electron_1.ipcMain.handle('add-to-table', (_, { tableName, element }) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const newElementsIds = yield knex(tableName).insert(element);
                return newElementsIds;
            }
            catch (_e) {
                return null;
            }
        }));
        electron_1.ipcMain.handle('edit-from-table', (_, { tableName, element }) => __awaiter(void 0, void 0, void 0, function* () {
            const { id } = element;
            const numberOfElementsUpdated = yield knex(tableName)
                .update(element)
                .where('id', id);
            return numberOfElementsUpdated;
        }));
    },
};
//# sourceMappingURL=abm.js.map