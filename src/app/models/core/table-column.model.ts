export interface TableColumn<T = any> {
  header: string;
  field: keyof T | ((item: T, ...args: any[]) => string);
}
