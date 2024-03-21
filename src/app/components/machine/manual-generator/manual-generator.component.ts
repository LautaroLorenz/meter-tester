import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  OnInit,
  Output,
} from '@angular/core';
import { APP_CONFIG } from '../../../../environments/environment';

@Component({
  selector: 'app-manual-generator',
  templateUrl: './manual-generator.component.html',
  styleUrls: ['./manual-generator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManualGeneratorComponent implements OnInit {
  @Output() adjustmentDone = new EventEmitter<void>();

  ngOnInit(): void {
    this.skip();
  }

  private skip(): void {
    if (!APP_CONFIG.skipSteps) {
      return;
    }

    setTimeout(() => this.adjustmentDone.emit());
  }
}
