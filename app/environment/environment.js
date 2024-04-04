"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.APP_CONFIG = void 0;
const environment_dev_1 = require("./environment.dev");
const environment_prod_1 = require("./environment.prod");
function APP_CONFIG(isDev) {
    return isDev ? environment_dev_1.APP_CONFIG : environment_prod_1.APP_CONFIG;
}
exports.APP_CONFIG = APP_CONFIG;
//# sourceMappingURL=environment.js.map