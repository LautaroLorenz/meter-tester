import { ForeignTable, TableRelationsMap } from './database.model';

export class RelationsManager {
  static mergeRelationsIntoRows<T>(
    rows: T[],
    relations: TableRelationsMap,
    foreignTables: ForeignTable[]
  ): T[] {
    if (Object.keys(relations).length === 0) {
      return rows;
    }
    if (foreignTables.length === 0) {
      return rows;
    }
    return rows.map((row: any) => {
      this.createForeignProp(row, foreignTables, relations);
      return row as T;
    });
  }

  private static createForeignProp(
    element: any,
    foreignTables: ForeignTable[],
    relations: TableRelationsMap
  ) {
    foreignTables.forEach((ft) => {
      if (element[ft.foreignKey] !== undefined) {
        if (element['foreign'] === undefined) {
          element['foreign'] = {};
        }
        element['foreign'][ft.propertyName] = relations[ft.tableName]?.find(
          (value) => value.id === element[ft.foreignKey]
        );
      }
      if (ft.foreignTables) {
        this.createForeignProp(
          element.foreign[ft.propertyName],
          ft.foreignTables,
          relations
        );
      }
    });
  }
}
