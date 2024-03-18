import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';

@Component({
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export abstract class EditDialogComponent<T> implements OnChanges {
  @Input() initialValue: T | undefined;

  @Output() dialogHide = new EventEmitter<void>();
  @Output() valueChange = new EventEmitter<T>();

  dialogOpened = false;
  formValid = false;
  formValue: T | undefined;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.initialValue) {
      this.reset();
      this.dialogOpened = !!changes.initialValue.currentValue;
    }
    this.afterSuperChanges();
  }

  closeDialog(): void {
    this.dialogOpened = false;
    this.initialValue = undefined;
    this.reset();
  }

  acceptChanges(): void {
    if (!this.formValue) {
      return;
    }
    this.valueChange.emit(this.formValue);
    this.dialogOpened = false;
  }

  protected afterSuperChanges(): void {}

  private reset(): void {
    this.formValid = false;
    this.formValue = undefined;
  }
}
