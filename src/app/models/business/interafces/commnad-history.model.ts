export interface CommandHistory {
  from: string;
  to: string;
  command: string;
  date: string;
}

export interface CommandHistoryColumn {
  header: string;
  field: string;
}
