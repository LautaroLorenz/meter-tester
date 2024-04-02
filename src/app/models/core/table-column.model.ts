import { TemplateRef } from '@angular/core';

export enum TC_AlignHorizontal {
  Text = 'Text',
  Number = 'Number',
  Alphanumeric = 'Alphanumeric',
}

export interface TableColumnBase {
  header: string;
  customStyles?: string;
}

export interface TableColumnField<T = any> extends TableColumnBase {
  field: keyof T | ((item: T, index: number) => string);
  alignHorizontal: TC_AlignHorizontal;
}

export interface TableColumnTemplate<T = any> extends TableColumnBase {
  template: TemplateRef<TableColumnTemplateContext<T>>;
  alignHorizontal?: TC_AlignHorizontal;
}

export interface TableColumnTemplateContext<T> {
  item: T;
  index: number;
}

export type TableColumn<T = any> = TableColumnField<T> | TableColumnTemplate<T>;
