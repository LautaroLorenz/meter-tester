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
const path = require("path");
let knex;
let created = false;
// Path de la base de datos en el directorio de datos del usuario
const userDataDir = electron_1.app.getPath('userData');
const dataBaseName = 'database.db';
const dataBasePath = path.join(userDataDir, dataBaseName);
const config = {
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
        afterCreate: (conn, cb) => conn.run('PRAGMA foreign_keys = ON', cb),
    },
};
function runSeedsFirstTime(knex) {
    return __awaiter(this, void 0, void 0, function* () {
        // Verifica si la base de datos está vacía
        const isEmpty = yield knex('meters')
            .count('* as count')
            .then((rows) => rows[0].count === 0);
        if (isEmpty) {
            // Si la base de datos está vacía, ejecuta los seeds
            knex.seed.run().then(() => {
                created = true;
            });
        }
    });
}
exports.default = {
    connect: () => {
        knex = require('knex')(config);
        // Actualizar base de datos
        knex.migrate.latest().then(() => {
            // Run seeds first time
            runSeedsFirstTime(knex);
        });
        return knex;
    },
    register: () => {
        electron_1.ipcMain.handle('get-database-path', () => __awaiter(void 0, void 0, void 0, function* () {
            return {
                dataBasePath,
            };
        }));
        electron_1.ipcMain.handle('get-database-connection-status', () => __awaiter(void 0, void 0, void 0, function* () {
            let status;
            yield knex
                .raw('select 1+1 as result')
                .then(() => {
                status = true;
            })
                .catch(() => {
                status = false;
            });
            return { status, created };
        }));
    },
};
//# sourceMappingURL=database.js.map