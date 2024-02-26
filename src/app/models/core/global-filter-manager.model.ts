import { AbmColum } from '../../components/abm/models/abm.model';

export class GlobalFilterManager {
  static transform(abmColumns: AbmColum[]): string[] {
    return abmColumns.reduce<string[]>((acc: string[], column: AbmColum) => {
      acc = acc.concat(column.field);
      if (column.colSpanColumns?.length) {
        acc = acc.concat(column.colSpanColumns.map(({ field }) => field));
      }
      return acc;
    }, []);
  }
}
