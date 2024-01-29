export interface BasicColumn {
  field: string;
  prefix?: string;
  suffix?: string;
  styleClass?: string;
}

export interface AbmColum extends BasicColumn {
  header: string;
  sortable: boolean;
  headerTooltip?: string;
  colSpan?: number;
  colSpanColumns?: BasicColumn[];
}
