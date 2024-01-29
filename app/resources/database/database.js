"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const knexfile_1 = require("./knexfile");
const abm_1 = require("../../commands/abm");
// const { setKnex: setEssayKnex } = require('../commands/essay');
let knex;
exports.default = {
    connect: ({ isProduction }) => {
        const environment = isProduction ? 'production' : 'development';
        knexfile_1.default.setIsProduction(isProduction);
        knex = require('knex')(knexfile_1.default[environment]);
        abm_1.default.setKnex(knex);
        // setEssayKnex(knex);
    },
};
//# sourceMappingURL=database.js.map