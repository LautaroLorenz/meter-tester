import { TC_GlobalFilter, TableColumn } from './table-column.model';

export class GlobalFilterManager {
  static transform(abmColumns: TableColumn[]): string[] {
    return abmColumns
      .filter(({ globalFilter }) => !!globalFilter)
      .flatMap(({ globalFilter }) => globalFilter as TC_GlobalFilter);
  }
}
