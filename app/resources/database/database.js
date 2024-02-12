"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const knexfile_1 = require("./knexfile");
let knex;
exports.default = {
    connect: ({ isProduction }) => {
        const environment = isProduction ? 'production' : 'development';
        knex = require('knex')(knexfile_1.default[environment]);
        return knex;
    },
};
//# sourceMappingURL=database.js.map