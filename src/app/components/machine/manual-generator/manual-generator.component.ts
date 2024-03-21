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

  adjusted = false;
  removed = false;

  ngOnInit(): void {
    this.skip();
  }

  userAdjustmentDone(): void {
    this.adjusted = true;
    this.adjustmentDone.emit();
  }

  removePanel(): void {
    this.removed = true;
  }

  private skip(): void {
    if (!APP_CONFIG.skipSteps) {
      return;
    }

    setTimeout(() => {
      this.userAdjustmentDone();
      this.removePanel();
    });
  }
}
