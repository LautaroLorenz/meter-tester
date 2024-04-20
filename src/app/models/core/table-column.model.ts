import { TemplateRef } from '@angular/core';

export type TC_Sortable = string | string[];

export type TC_GlobalFilter = string | string[];

export enum TC_AlignHorizontal {
  Text = 'Text',
  Number = 'Number',
  Alphanumeric = 'Alphanumeric',
}

export interface TableColumnBase {
  header: string;
  sortable?: TC_Sortable;
  globalFilter?: TC_GlobalFilter;
  headerTooltip?: string;
  customStyles?: string;
}

export interface TableColumnField<T = any> extends TableColumnBase {
  field: keyof T | ((item: T, index: number) => string) | string;
  alignHorizontal: TC_AlignHorizontal;
}

export interface TableColumnTemplate<T = any> extends TableColumnBase {
  template: TemplateRef<TableColumnTemplateContext<T>>;
}

export interface TableColumnTemplateContext<T> {
  item: T;
  index: number;
}

export type TableColumn<T = any> = TableColumnField<T> | TableColumnTemplate<T>;
