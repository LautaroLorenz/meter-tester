import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-manual-generator',
  templateUrl: './manual-generator.component.html',
  styleUrls: ['./manual-generator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManualGeneratorComponent {
  @Output() adjustmentDone = new EventEmitter<void>();
}
