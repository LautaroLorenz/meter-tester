import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { APP_CONFIG } from '../../../environments/environment';

@Component({
  selector: 'app-photocell-adjusment-request',
  templateUrl: './photocell-adjusment-request.component.html',
  styleUrls: ['./photocell-adjusment-request.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PhotocellAdjusmentRequestComponent implements OnInit {
  @Input() meterConstant!: number;

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
