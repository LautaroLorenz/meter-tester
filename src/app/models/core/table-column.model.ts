import { TemplateRef } from '@angular/core';

export enum TC_AlignHorizontal {
  Text = 'Text',
  Number = 'Number',
  Alphanumeric = 'Alphanumeric',
}

export interface TableColumnBase {
  header: string;
  alignHorizontal: TC_AlignHorizontal;
  customStyles?: string;
}

export interface TableColumnField<T = any> extends TableColumnBase {
  field: keyof T | ((item: T, index: number) => string);
}

export interface TableColumnTemplate<T = any> extends TableColumnBase {
  template: TemplateRef<TableColumnTemplateContext<T>>;
}

export interface TableColumnTemplateContext<T> {
  item: T;
  index: number;
}

export type TableColumn<T = any> = TableColumnField<T> | TableColumnTemplate<T>;
