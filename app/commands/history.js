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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const createNews = (knex, rows, transaction, tableName) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, e_1, _b, _c;
    const createdRows = rows.filter(({ id }) => !id);
    try {
        for (var _d = true, createdRows_1 = __asyncValues(createdRows), createdRows_1_1; createdRows_1_1 = yield createdRows_1.next(), _a = createdRows_1_1.done, !_a;) {
            _c = createdRows_1_1.value;
            _d = false;
            try {
                const et = _c;
                const { foreign, animationState, form_control_raw } = et, remainingProperties = __rest(et, ["foreign", "animationState", "form_control_raw"]);
                const propertiesToInsert = Object.assign({}, remainingProperties);
                if (!!form_control_raw) {
                    propertiesToInsert.form_control_raw = JSON.stringify(form_control_raw);
                }
                const [id] = yield knex(tableName)
                    .transacting(transaction)
                    .insert(propertiesToInsert);
                et.id = id;
            }
            finally {
                _d = true;
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (!_d && !_a && (_b = createdRows_1.return)) yield _b.call(createdRows_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return createdRows;
});
exports.default = {
    register: (knex) => {
        electron_1.ipcMain.handle('save-history-essay', (_, { historyEssayRows }) => __awaiter(void 0, void 0, void 0, function* () {
            // open database transaction
            return yield knex.transaction((transaction) => __awaiter(void 0, void 0, void 0, function* () {
                const rowsCreated = yield createNews(knex, historyEssayRows, transaction, 'history_essay');
                return { rowsCreated };
            }));
        }));
    },
};
//# sourceMappingURL=history.js.map