"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.APP_CONFIG = void 0;
const environment_dev_1 = require("./environment.dev");
const environment_e2e_1 = require("./environment.e2e");
const environment_prod_1 = require("./environment.prod");
function APP_CONFIG(environment) {
    switch (environment) {
        case 'dev':
            return environment_dev_1.APP_CONFIG;
        case 'e2e':
            return environment_e2e_1.APP_CONFIG;
        default:
            return environment_prod_1.APP_CONFIG;
    }
}
exports.APP_CONFIG = APP_CONFIG;
//# sourceMappingURL=environment.js.map