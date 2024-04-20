import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  TemplateRef,
  inject,
} from '@angular/core';
import {
  TC_AlignHorizontal,
  TableColumn,
  TableColumnField,
  TableColumnTemplateContext,
} from '../../models/core/table-column.model';
import { DotStringAsObjectPipe } from '../../pipes/core/dot-string-as-object.pipe';

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
  alignHorizontal!: TC_AlignHorizontal;

  readonly TC_AlignHorizontal = TC_AlignHorizontal;

  private readonly dDotStringAsObjectPipe = inject(DotStringAsObjectPipe);

  ngOnInit(): void {
    if ('field' in this.tableColumn) {
      this.value = this.getColValue(this.data, this.tableColumn);
      this.alignHorizontal = this.tableColumn.alignHorizontal;
    }
    if ('template' in this.tableColumn) {
      this.template = this.tableColumn.template;
    }
  }

  private getColValue(item: T, col: TableColumnField<T>): string {
    if (typeof col.field === 'function') {
      return col.field(item, this.index);
    }
    return this.dDotStringAsObjectPipe.transform(
      item as object,
      col.field as string
    ) as string;
  }
}
