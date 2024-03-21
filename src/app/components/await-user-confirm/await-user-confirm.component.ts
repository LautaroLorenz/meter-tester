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
  selector: 'app-await-user-confirm',
  templateUrl: './await-user-confirm.component.html',
  styleUrls: ['./await-user-confirm.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AwaitUserConfirmComponent implements OnInit {
  @Input() headerText!: string;
  @Input() confirmButtonText!: string;
  @Input() confirmButtonIcon!: string;
  @Input() afterConfirmationChipText!: string;
  @Input() afterConfirmationChipIcon!: string;
  @Output() userConfirm = new EventEmitter<void>();
  @Output() userRemove = new EventEmitter<void>();

  confirmed = false;
  removed = false;

  ngOnInit(): void {
    this.skip();
  }

  onUserConfirm(): void {
    this.confirmed = true;
    this.userConfirm.emit();
  }

  removePanel(): void {
    this.removed = true;
    this.userRemove.emit();
  }

  private skip(): void {
    if (!APP_CONFIG.skipSteps) {
      return;
    }

    setTimeout(() => {
      this.onUserConfirm();
      this.removePanel();
    });
  }
}
