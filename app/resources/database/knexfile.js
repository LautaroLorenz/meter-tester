"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const databasePath_1 = require("./databasePath");
exports.default = {
    client: 'sqlite3',
    connection: databasePath_1.dataBasePath,
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
//# sourceMappingURL=knexfile.js.map