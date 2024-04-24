import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Tags } from '../../../models/business/database/static.model';

@Component({
  selector: 'app-stand-used-widget',
  templateUrl: './stand-used-widget.component.html',
  styleUrls: ['./stand-used-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StandUsedWidgetComponent {
  @Input() tags!: Tags[];
}
