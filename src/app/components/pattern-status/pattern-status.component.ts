import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { PatternStatus } from '../../models/business/interafces/pattern-status.model';

@Component({
  selector: 'app-pattern-status',
  templateUrl: './pattern-status.component.html',
  styleUrls: ['./pattern-status.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatternStatusComponent {
  @Input() patternStatus!: PatternStatus;
}
