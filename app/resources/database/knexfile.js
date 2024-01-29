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
const path = require('path');
function getDatabasePath(isProduction) {
    const separator = path.sep;
    if (isProduction) {
        return `${__dirname}${separator}database.db`.replace(`${separator}app.asar${separator}resources${separator}database`, '');
    }
    else {
        return `${__dirname}${separator}..${separator}..${separator}..${separator}src${separator}assets${separator}database.db`;
    }
}
const developmentPath = getDatabasePath(false);
const productionPath = getDatabasePath(true);
/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
exports.default = {
    register: () => {
        electron_1.ipcMain.handle('get-database-path', () => __awaiter(void 0, void 0, void 0, function* () {
            return {
                developmentPath,
                productionPath,
            };
        }));
    },
    development: {
        client: 'sqlite3',
        connection: developmentPath,
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
        connection: productionPath,
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