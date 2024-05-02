"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFilterConditions = exports.F_LogicOperator = exports.F_MatchMode = exports.F_ComparisonOperator = void 0;
var F_ComparisonOperator;
(function (F_ComparisonOperator) {
    F_ComparisonOperator["gte"] = ">=";
    F_ComparisonOperator["lte"] = "<=";
    F_ComparisonOperator["like"] = "LIKE";
    F_ComparisonOperator["equal"] = "=";
})(F_ComparisonOperator = exports.F_ComparisonOperator || (exports.F_ComparisonOperator = {}));
var F_MatchMode;
(function (F_MatchMode) {
    F_MatchMode["dateIs"] = "dateIs";
    F_MatchMode["dateBefore"] = "dateBefore";
    F_MatchMode["dateAfter"] = "dateAfter";
    F_MatchMode["range"] = "range";
    F_MatchMode["equals"] = "equals";
    F_MatchMode["like"] = "like";
})(F_MatchMode = exports.F_MatchMode || (exports.F_MatchMode = {}));
var F_LogicOperator;
(function (F_LogicOperator) {
    F_LogicOperator["and"] = "and";
    F_LogicOperator["or"] = "or";
})(F_LogicOperator = exports.F_LogicOperator || (exports.F_LogicOperator = {}));
function getFilterConditions(metaData) {
    switch (metaData.matchMode) {
        case F_MatchMode.dateIs:
            if (metaData.value === null) {
                return;
            }
            const dateValue = new Date(metaData.value);
            // Configura la fecha al principio del día (00:00:00)
            const startDateValue = new Date(dateValue.getFullYear(), dateValue.getMonth(), dateValue.getDate(), 0, 0, 0);
            // Configura la fecha al final del día (23:59:59)
            const endDateValue = new Date(dateValue.getFullYear(), dateValue.getMonth(), dateValue.getDate(), 23, 59, 59);
            return {
                logicOperator: F_LogicOperator.and,
                conditions: [
                    {
                        comparisonOperator: F_ComparisonOperator.gte,
                        value: startDateValue,
                    },
                    {
                        comparisonOperator: F_ComparisonOperator.lte,
                        value: endDateValue,
                    },
                ],
            };
        case F_MatchMode.dateBefore:
            if (metaData.value === null) {
                return;
            }
            const dateBeforeValue = new Date(metaData.value);
            const startDateBeforeValue = new Date(dateBeforeValue.getFullYear(), dateBeforeValue.getMonth(), dateBeforeValue.getDate(), 0, 0, 0);
            return {
                comparisonOperator: F_ComparisonOperator.gte,
                value: startDateBeforeValue,
            };
        case F_MatchMode.dateAfter:
            if (metaData.value === null) {
                return;
            }
            const dateAfterValue = new Date(metaData.value);
            const startDateAfterValue = new Date(dateAfterValue.getFullYear(), dateAfterValue.getMonth(), dateAfterValue.getDate(), 23, 59, 59);
            return {
                comparisonOperator: F_ComparisonOperator.lte,
                value: startDateAfterValue,
            };
        case F_MatchMode.range:
            if (metaData.value === null || metaData.value.length < 2) {
                return;
            }
            const [beforeValue, afterValue] = metaData.value;
            if (!beforeValue || !afterValue) {
                return;
            }
            const dateBefore = new Date(beforeValue);
            const dateAfter = new Date(afterValue);
            // Configura la fecha al principio del día (00:00:00)
            const startRangeDateValue = new Date(dateBefore.getFullYear(), dateBefore.getMonth(), dateBefore.getDate(), 0, 0, 0);
            // Configura la fecha al final del día (23:59:59)
            const endRangeDateValue = new Date(dateAfter.getFullYear(), dateAfter.getMonth(), dateAfter.getDate(), 23, 59, 59);
            return {
                logicOperator: F_LogicOperator.and,
                conditions: [
                    {
                        comparisonOperator: F_ComparisonOperator.gte,
                        value: startRangeDateValue,
                    },
                    {
                        comparisonOperator: F_ComparisonOperator.lte,
                        value: endRangeDateValue,
                    },
                ],
            };
        case F_MatchMode.equals:
            if (metaData.value === null) {
                return;
            }
            return {
                comparisonOperator: F_ComparisonOperator.equal,
                value: metaData.value,
            };
        case F_MatchMode.like:
            if (metaData.value === null) {
                return;
            }
            return {
                comparisonOperator: F_ComparisonOperator.like,
                value: metaData.value,
            };
    }
}
exports.getFilterConditions = getFilterConditions;
//# sourceMappingURL=filters.js.map