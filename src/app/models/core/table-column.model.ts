export enum TC_AlignHorizontal {
  Text = 'Text',
  Number = 'Number',
  Alphanumeric = 'Alphanumeric',
}

export interface TableColumn<T = any> {
  header: string;
  field: keyof T | ((item: T, ...args: any[]) => string);
  alignHorizontal: TC_AlignHorizontal;
}
