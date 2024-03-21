import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-photocell-adjusment-request',
  templateUrl: './photocell-adjusment-request.component.html',
  styleUrls: ['./photocell-adjusment-request.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PhotocellAdjusmentRequestComponent {
  @Input() meterConstant!: number;
  @Output() adjustmentDone = new EventEmitter<void>();
}
