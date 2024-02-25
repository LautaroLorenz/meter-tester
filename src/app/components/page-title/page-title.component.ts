import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-page-title',
  templateUrl: './page-title.component.html',
  styleUrls: ['./page-title.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageTitleComponent {
  @Input() title = '';
  @Input() showBack = false;

  @Output() backEvent = new EventEmitter<boolean>();
}
