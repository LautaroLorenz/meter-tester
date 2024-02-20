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
const essayTemplateCreateOrEdit = (knex, essayTemplate, transaction) => __awaiter(void 0, void 0, void 0, function* () {
    const querybuilder = knex('essay_templates').transacting(transaction);
    const essayTemplateCopy = Object.assign({}, essayTemplate);
    essayTemplateCopy.name = (essayTemplateCopy.name || '').toString().trim();
    if (essayTemplateCopy.id) {
        yield querybuilder
            .update(essayTemplateCopy)
            .where('id', essayTemplateCopy.id);
    }
    else {
        const [newEssayTemplateId] = yield querybuilder.insert(essayTemplateCopy);
        essayTemplateCopy.id = newEssayTemplateId;
    }
    return essayTemplateCopy;
});
const formatEssayTemplateSteps = (essayTemplateSteps, essayTemplateId) => essayTemplateSteps.map((essayTemplateStep, index) => (Object.assign(Object.assign({}, essayTemplateStep), { order: index + 1, essay_template_id: essayTemplateId })));
const essayTemplateStepsUpdateExisting = (knex, essayTemplateSteps, transaction) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, e_1, _b, _c;
    const essayTemplateStepsToUpdate = essayTemplateSteps.filter(({ id }) => id);
    try {
        for (var _d = true, essayTemplateStepsToUpdate_1 = __asyncValues(essayTemplateStepsToUpdate), essayTemplateStepsToUpdate_1_1; essayTemplateStepsToUpdate_1_1 = yield essayTemplateStepsToUpdate_1.next(), _a = essayTemplateStepsToUpdate_1_1.done, !_a;) {
            _c = essayTemplateStepsToUpdate_1_1.value;
            _d = false;
            try {
                const et = _c;
                const { foreign, animationState, form_control_raw } = et, remainingProperties = __rest(et, ["foreign", "animationState", "form_control_raw"]);
                const propertiesToUpdate = Object.assign(Object.assign({}, remainingProperties), { form_control_raw: JSON.stringify(form_control_raw) });
                yield knex('essay_templates_steps')
                    .transacting(transaction)
                    .update(propertiesToUpdate)
                    .where('id', et.id);
            }
            finally {
                _d = true;
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (!_d && !_a && (_b = essayTemplateStepsToUpdate_1.return)) yield _b.call(essayTemplateStepsToUpdate_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return essayTemplateStepsToUpdate;
});
const essayTemplateStepsCreateNews = (knex, essayTemplateSteps, transaction) => __awaiter(void 0, void 0, void 0, function* () {
    var _e, e_2, _f, _g;
    const essayTemplateStepsToCreate = essayTemplateSteps.filter(({ id }) => !id);
    try {
        for (var _h = true, essayTemplateStepsToCreate_1 = __asyncValues(essayTemplateStepsToCreate), essayTemplateStepsToCreate_1_1; essayTemplateStepsToCreate_1_1 = yield essayTemplateStepsToCreate_1.next(), _e = essayTemplateStepsToCreate_1_1.done, !_e;) {
            _g = essayTemplateStepsToCreate_1_1.value;
            _h = false;
            try {
                const et = _g;
                const { foreign, animationState, form_control_raw } = et, remainingProperties = __rest(et, ["foreign", "animationState", "form_control_raw"]);
                const propertiesToInsert = Object.assign(Object.assign({}, remainingProperties), { form_control_raw: JSON.stringify(form_control_raw) });
                const [id] = yield knex('essay_templates_steps')
                    .transacting(transaction)
                    .insert(propertiesToInsert);
                et.id = id;
            }
            finally {
                _h = true;
            }
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (!_h && !_e && (_f = essayTemplateStepsToCreate_1.return)) yield _f.call(essayTemplateStepsToCreate_1);
        }
        finally { if (e_2) throw e_2.error; }
    }
    return essayTemplateStepsToCreate;
});
const essayTemplateStepsDeleteOlds = (knex, essayTemplateId, essayTemplateSteps, transaction) => __awaiter(void 0, void 0, void 0, function* () {
    const oldRelations = yield knex('essay_templates_steps')
        .transacting(transaction)
        .select('id')
        .where('essay_template_id', essayTemplateId);
    const keepIds = essayTemplateSteps.map(({ id }) => id);
    const relationsToDelete = oldRelations
        .filter(({ id }) => !keepIds.includes(id))
        .map(({ id }) => id);
    if (relationsToDelete.length > 0) {
        yield knex('essay_templates_steps')
            .transacting(transaction)
            .delete()
            .whereIn('id', relationsToDelete);
    }
});
exports.default = {
    register: (knex) => {
        electron_1.ipcMain.handle('save-essay-template', (_, { essayTemplate, essayTemplateSteps }) => __awaiter(void 0, void 0, void 0, function* () {
            // open database transaction
            return yield knex.transaction((transaction) => __awaiter(void 0, void 0, void 0, function* () {
                essayTemplate = yield essayTemplateCreateOrEdit(knex, essayTemplate, transaction);
                essayTemplateSteps = formatEssayTemplateSteps(essayTemplateSteps, essayTemplate.id);
                const essayTemplateStepsUpdated = yield essayTemplateStepsUpdateExisting(knex, essayTemplateSteps, transaction);
                const essayTemplateStepsCreated = yield essayTemplateStepsCreateNews(knex, essayTemplateSteps, transaction);
                essayTemplateSteps = [
                    ...essayTemplateStepsUpdated,
                    ...essayTemplateStepsCreated,
                ].sort((a, b) => a.order - b.order);
                yield essayTemplateStepsDeleteOlds(knex, essayTemplate.id, essayTemplateSteps, transaction);
                return { essayTemplate, essayTemplateSteps };
            }));
        }));
    },
};
//# sourceMappingURL=essay.js.map