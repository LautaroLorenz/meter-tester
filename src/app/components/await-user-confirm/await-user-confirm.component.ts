import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-await-user-confirm',
  templateUrl: './await-user-confirm.component.html',
  styleUrls: ['./await-user-confirm.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AwaitUserConfirmComponent {
  @Input() headerText!: string;
  @Input() confirmButtonText!: string;
  @Input() confirmButtonIcon!: string;
  @Input() afterConfirmationChipText!: string;
  @Input() afterConfirmationChipIcon!: string;
  @Output() userConfirm = new EventEmitter<void>();
  @Output() userRemove = new EventEmitter<void>();

  confirmed = false;
  removed = false;

  onUserConfirm(): void {
    this.confirmed = true;
    this.userConfirm.emit();
  }

  removePanel(): void {
    this.removed = true;
    this.userRemove.emit();
  }
}
