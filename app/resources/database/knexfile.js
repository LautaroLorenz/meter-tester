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
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
function getProductionPath() {
    return `${__dirname}/database.db`.replace('/app.asar/resources/database', '');
}
/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
exports.default = {
    register: () => {
        electron_1.ipcMain.handle('get-database-path', () => __awaiter(void 0, void 0, void 0, function* () {
            return getProductionPath();
        }));
    },
    development: {
        client: 'sqlite3',
        connection: `${__dirname}/../../../src/assets/database.db`,
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
            afterCreate: (conn, cb) => conn.run('PRAGMA foreign_keys = ON', cb),
        },
    },
    production: {
        client: 'sqlite3',
        connection: `${__dirname}/database.db`.replace('/app.asar/resources/database', ''),
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
            afterCreate: (conn, cb) => conn.run('PRAGMA foreign_keys = ON', cb),
        },
    },
};
//# sourceMappingURL=knexfile.js.map