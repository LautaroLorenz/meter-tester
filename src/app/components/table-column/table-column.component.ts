import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  TemplateRef,
} from '@angular/core';
import {
  TC_AlignHorizontal,
  TableColumn,
  TableColumnField,
  TableColumnTemplateContext,
} from '../../models/core/table-column.model';

@Component({
  selector: 'app-table-column',
  templateUrl: './table-column.component.html',
  styleUrls: ['./table-column.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableColumnComponent<T> implements OnInit {
  @Input() tableColumn!: TableColumn<T>;
  @Input() data!: T;
  @Input() index!: number;

  value!: string;
  template!: TemplateRef<TableColumnTemplateContext<any>>;

  readonly TC_AlignHorizontal = TC_AlignHorizontal;

  ngOnInit(): void {
    if ('field' in this.tableColumn) {
      this.value = this.getColValue(this.data, this.tableColumn);
    }
    if ('template' in this.tableColumn) {
      this.template = this.tableColumn.template;
    }
  }

  private getColValue(item: T, col: TableColumnField<T>): string {
    if (typeof col.field === 'function') {
      return col.field(item, this.index);
    }
    return item[col.field] as string;
  }
}
