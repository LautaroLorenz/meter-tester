"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataBasePath = void 0;
const electron_1 = require("electron");
const path = require("path");
const os = require("os");
// Path de la base de datos en el directorio de datos del usuario
const username = os.userInfo().username;
const userDataDir = (_a = electron_1.app === null || electron_1.app === void 0 ? void 0 : electron_1.app.getPath('userData')) !== null && _a !== void 0 ? _a : calculateUserDataDir();
const dataBaseName = 'database.db';
// Esta función se utiliza cunado usamos comandos knex ubicados en el package.json
// se debe a que en ese contexto electron.app es undefined porque estamos fuera de NodeJs
function calculateUserDataDir() {
    switch (os.platform()) {
        case 'win32':
            return path.join('C:', 'Users', username, 'AppData', 'Roaming', 'oelec-ce-soft');
        case 'darwin':
            return path.join('/Users', username, 'Library', 'Application Support', 'oelec-ce-soft');
        case 'linux':
            return path.join('/home', username, '.config', 'oelec-ce-soft');
        default:
            console.log('Platform not supported');
            break;
    }
    return '';
}
exports.dataBasePath = path.join(userDataDir, dataBaseName);
//# sourceMappingURL=databasePath.js.map