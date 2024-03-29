import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { TableColumn } from '../../models/core/table-column.model';

@Component({
  selector: 'app-table-column',
  templateUrl: './table-column.component.html',
  styleUrls: ['./table-column.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableColumnComponent<T> implements OnInit {
  @Input() tableColumn!: TableColumn<T>;
  @Input() data!: T;

  value!: string;

  ngOnInit(): void {
    this.value = this.getColValue(this.data, this.tableColumn);
  }

  private getColValue(item: T, col: TableColumn<T>): string {
    if (typeof col.field === 'function') {
      return col.field(item) as string;
    }
    return item[col.field as keyof T] as string;
  }
}
