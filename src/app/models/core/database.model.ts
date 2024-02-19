export interface TableRelationsMap {
  [tableName: TableName]: any[];
}

export interface RequestTableResponse<T> {
  tableNameReply: string;
  rows: T[];
  relations: TableRelationsMap;
}

export interface DbForeignKey {
  foreign: {
    [property: string]: any;
  };
}

export type TableName = string;

export interface DbTableContext {
  tableName: TableName;
  foreignTables: ForeignTable[];
}

export interface ForeignTable {
  tableName: TableName;
  foreignKey: string;
  properyName: string;
}

export enum WhereKind {
  where = 'where',
  andWhere = 'andWhere',
  orWhere = 'orWhere',
}

export enum WhereOperator {
  major = '>',
  minor = '<',
  like = 'like',
  in = 'in',
  notIn = 'not in',
  equal = '=',
}

export interface Where {
  kind: WhereKind;
  columnName: string;
  operator: WhereOperator;
  value: any;
}
