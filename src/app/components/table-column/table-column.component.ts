import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import {
  TC_AlignHorizontal,
  TableColumn,
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

  readonly TC_AlignHorizontal = TC_AlignHorizontal;

  ngOnInit(): void {
    this.value = this.getColValue(this.data, this.tableColumn);
  }

  private getColValue(item: T, col: TableColumn<T>): string {
    if (typeof col.field === 'function') {
      return col.field(item, this.index);
    }
    return item[col.field] as string;
  }
}
