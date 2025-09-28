import { TemplateRef } from '@angular/core';

export type TC_FilterDropdownOption = {
    label: string;
    value: any;
};

export enum TC_Operator {
    and = 'and',
    or = 'or'
}

export enum TC_FilterType {
    date = 'date',
    dropdown = 'dropdown'
}

export enum TC_MatchMode {
    startsWith = 'startsWith', // Comprueba si el valor de la columna comienza con el valor del filtro.
    endsWith = 'endsWith', // Comprueba si el valor de la columna termina con el valor del filtro.
    contains = 'contains', // Comprueba si el valor de la columna contiene el valor del filtro.
    equals = 'equals', // Comprueba si el valor de la columna es igual al valor del filtro.
    like = 'like',
    notEquals = 'notEquals', // Comprueba si el valor de la columna no es igual al valor del filtro.
    lt = 'lt', // Comprueba si el valor de la columna es menor que el valor del filtro.
    lte = 'lte', // Comprueba si el valor de la columna es menor o igual que el valor del filtro.
    gt = 'gt', // Comprueba si el valor de la columna es mayor que el valor del filtro.
    gte = 'gte', // Comprueba si el valor de la columna es mayor o igual que el valor del filtro.
    is = 'is', // Comprueba si el valor de la columna es igual al valor del filtro, alias para equals.
    dateIs = 'dateIs',
    dateBefore = 'dateBefore',
    dateAfter = 'dateAfter',
    range = 'range',
    isNot = 'isNot', // Comprueba si el valor de la columna no es igual al valor del filtro, alias para notEquals.
    before = 'before', // Comprueba si el valor de la fecha es anterior a la fecha del filtro.
    after = 'after' // Comprueba si el valor de la fecha es posterior a la fecha del filtro.
}

export type TC_TemplateName = string;

export type TC_Sortable = string | string[];

export type TC_GlobalFilter = string | string[];

export type TC_FilterBase = {
    field: string;
    type: TC_FilterType;
    operator: TC_Operator;
    matchMode: TC_MatchMode;
    showMatchModes: boolean;
    showAddButton: boolean;
    showOperator: boolean;
    hideOnClear: boolean;
    showApplyButton: boolean;
    showClearButton: boolean;
    maxConstraints: number;
    placeholder?: string;
};

export interface TC_FilterDate extends TC_FilterBase {
    type: TC_FilterType.date;
}

export interface TC_FilterDropdown extends TC_FilterBase {
    type: TC_FilterType.dropdown;
    options: TC_FilterDropdownOption[];
    showClear: boolean;
}

export type TC_Filter = TC_FilterDate | TC_FilterDropdown;

export enum TC_AlignHorizontal {
    Text = 'Text',
    Number = 'Number',
    Alphanumeric = 'Alphanumeric'
}

export interface TableColumnBase {
    header: string;
    filter?: TC_Filter;
    sortable?: TC_Sortable;
    globalFilter?: TC_GlobalFilter;
    headerTooltip?: string;
    headerStyle?: string;
    customStyles?: string;
    tooltipStyleClass?: string;
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

export type TableColumn<T = any> = TableColumnField<T> | TableColumnTemplate<T> | TableColumnTemplatename;
