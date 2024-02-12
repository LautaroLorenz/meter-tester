import {
  Directive,
  OnInit,
  ElementRef,
  OnDestroy,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';

@Directive({
  selector: '[appFocused]',
})
export class InputFocusedDirective implements OnInit, OnDestroy {
  @Input() appSelectOnFocus = false;
  @Input() appFocused!: boolean | string;
  @Output() appFocusedChange = new EventEmitter<boolean>();

  private inputField: HTMLInputElement;
  private setFocusedTrueFn: any;
  private setFocusedFalseFn: any;

  constructor(private readonly hostElement: ElementRef) {
    this.inputField = this.hostElement.nativeElement as HTMLInputElement;
    this.setFocusedTrueFn = this.setFocusedTrue.bind(this);
    this.setFocusedFalseFn = this.setFocusedFalse.bind(this);
  }

  private setFocusedTrue(): void {
    if (this.appSelectOnFocus) {
      this.inputField.select();
    }

    this.appFocusedChange.emit(true);
  }

  private setFocusedFalse(): void {
    this.appFocusedChange.emit(false);
  }

  ngOnInit() {
    this.inputField.addEventListener('focus', this.setFocusedTrueFn, true);
    this.inputField.addEventListener('blur', this.setFocusedFalseFn, true);
  }

  ngOnDestroy(): void {
    this.inputField.removeEventListener('focus', this.setFocusedTrueFn, true);
    this.inputField.removeEventListener('blur', this.setFocusedFalseFn, true);
  }
}
