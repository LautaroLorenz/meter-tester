import { TemplateRef } from '@angular/core';

export type TC_TemplateName = string;

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
  // el template se inicializa en el componente que declara la columna
  template: TemplateRef<TableColumnTemplateContext<T>>;
}

export interface TableColumnTemplatename<T = any> extends TableColumnBase {
  // el componente que declara la columna, indica el nombre del template
  templateName: TC_TemplateName;
  // el template se inicializa en abm.component.ts
  template: TemplateRef<TableColumnTemplateContext<T>> | undefined;
}

export interface TableColumnTemplateContext<T> {
  item: T;
  index: number;
}

export type TableColumn<T = any> =
  | TableColumnField<T>
  | TableColumnTemplate<T>
  | TableColumnTemplatename;
