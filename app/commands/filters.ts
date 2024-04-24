export type TableName = string;

export enum F_ComparisonOperator {
  gte = '>=',
  lte = '<=',
  like = 'LIKE',
  equal = '=',
}

export enum F_MatchMode {
  dateIs = 'dateIs',
  dateBefore = 'dateBefore',
  dateAfter = 'dateAfter',
  equals = 'equals',
  like = 'like',
}

export enum F_LogicOperator {
  and = 'and',
  or = 'or',
}

export type FilterCondition = {
  comparisonOperator: F_ComparisonOperator;
  value: any;
};

export type FilterConditions = {
  logicOperator: F_LogicOperator;
  conditions: FilterCondition[];
};

export type Filters = Record<TableName, FilterMetaData | FilterMetaData[]>;

export type FilterTypeBase<T> = {
  matchMode: F_MatchMode;
  operator: F_LogicOperator;
  value: T;
};
export interface F_DateIs extends FilterTypeBase<string | number> {
  matchMode: F_MatchMode.dateIs;
}
export interface F_Equals extends FilterTypeBase<number> {
  matchMode: F_MatchMode.equals;
}
export interface F_Like extends FilterTypeBase<string> {
  matchMode: F_MatchMode.like;
}
export interface F_DateBefore extends FilterTypeBase<string | number> {
  matchMode: F_MatchMode.dateBefore;
}
export interface F_DateAfter extends FilterTypeBase<string | number> {
  matchMode: F_MatchMode.dateAfter;
}
export type FilterMetaData =
  | F_DateIs
  | F_DateBefore
  | F_DateAfter
  | F_Equals
  | F_Like;

export function getFilterConditions(
  metaData: FilterMetaData
): FilterCondition | FilterConditions | undefined {
  switch (metaData.matchMode) {
    case F_MatchMode.dateIs:
      if (metaData.value === null) {
        return;
      }
      const dateValue = new Date(metaData.value);
      // Configura la fecha al principio del día (00:00:00)
      const startDateValue = new Date(
        dateValue.getFullYear(),
        dateValue.getMonth(),
        dateValue.getDate(),
        0,
        0,
        0
      );
      // Configura la fecha al final del día (23:59:59)
      const endDateValue = new Date(
        dateValue.getFullYear(),
        dateValue.getMonth(),
        dateValue.getDate(),
        23,
        59,
        59
      );
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
      const startDateBeforeValue = new Date(
        dateBeforeValue.getFullYear(),
        dateBeforeValue.getMonth(),
        dateBeforeValue.getDate(),
        0,
        0,
        0
      );
      return {
        comparisonOperator: F_ComparisonOperator.gte,
        value: startDateBeforeValue,
      };
    case F_MatchMode.dateAfter:
      if (metaData.value === null) {
        return;
      }
      const dateAfterValue = new Date(metaData.value);
      const startDateAfterValue = new Date(
        dateAfterValue.getFullYear(),
        dateAfterValue.getMonth(),
        dateAfterValue.getDate(),
        23,
        59,
        59
      );
      return {
        comparisonOperator: F_ComparisonOperator.lte,
        value: startDateAfterValue,
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
