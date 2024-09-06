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
const knexfile_1 = require("./knexfile");
const databasePath_1 = require("./databasePath");
const Store = require("electron-store");
const store = new Store();
let knex;
let created = false;
let updated = false;
let updatedError = false;
let mainWindow;
function runSeedsFirstTime(knex) {
    return __awaiter(this, void 0, void 0, function* () {
        // Verifica si la base de datos está vacía
        const isEmpty = yield knex('steps')
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
function doConnection() {
    knex = require('knex')(knexfile_1.default);
    // Actualizar base de datos
    knex.migrate
        .latest()
        .then((migrations) => {
        var _a;
        if (((_a = migrations === null || migrations === void 0 ? void 0 : migrations[1]) === null || _a === void 0 ? void 0 : _a.length) > 0) {
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
}
exports.default = {
    connect: () => {
        return doConnection();
    },
    register: () => {
        electron_1.ipcMain.handle('get-database-path', () => __awaiter(void 0, void 0, void 0, function* () {
            return {
                dataBasePath: databasePath_1.dataBasePath,
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
            const response = { status, created, updated, updatedError, location: '' };
            if (status) {
                response.location = databasePath_1.dataBasePath;
            }
            // una vez enviado el estado, volvemos los flags a cero
            setTimeout(() => {
                created = false;
                updated = false;
                updatedError = false;
            }, 100);
            return response;
        }));
        // seleccionar la base de datos a la que se realizará la conexión
        electron_1.ipcMain.handle('change-connection-path', () => __awaiter(void 0, void 0, void 0, function* () {
            if (!mainWindow) {
                return null;
            }
            const result = yield electron_1.dialog.showOpenDialog(mainWindow, {
                title: 'Seleccionar archivo de base de datos',
                buttonLabel: 'Seleccionar',
                properties: ['openFile'],
                filters: [{ name: 'Base de datos', extensions: ['db'] }]
            });
            if (result.canceled || result.filePaths.length === 0) {
                return { success: false, message: 'No file selected' };
            }
            const dataBasePath = result.filePaths[0];
            try {
                // Reconectar con la nueva base de datos
                knexfile_1.default.connection = dataBasePath;
                doConnection();
                // Hacer una query para ver si la base de datos está ok
                const isEmpty = yield knex('steps')
                    .count('* as count')
                    .then((rows) => rows[0].count === 0);
                if (isEmpty) {
                    return { success: false, message: 'Connection failed: Not valid database' };
                }
                // Guardar el path de conexión en el store
                store.set('dbDirectory', dataBasePath);
                return { success: true, message: 'Database connected successfully' };
            }
            catch (error) {
                return { success: false, message: `Connection failed: ${error === null || error === void 0 ? void 0 : error.message}` };
            }
        }));
    },
    setMainWindow: (mainWindowParam) => {
        mainWindow = mainWindowParam;
    }
};
//# sourceMappingURL=database.js.map