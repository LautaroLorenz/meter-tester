import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { PrimeIcons } from 'primeng/api';

@Component({
  selector: 'app-page-title',
  templateUrl: './page-title.component.html',
  styleUrls: ['./page-title.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageTitleComponent {
  @Input() title = '';
  @Input() headerIcon: PrimeIcons | null = null;
  @Input() showBack = false;

  @Output() backEvent = new EventEmitter<boolean>();
}
