import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
  OnDestroy,
  forwardRef,
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  NgControl,
  ValidationErrors,
} from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-input-error',
  templateUrl: './input-error.component.html',
  styleUrls: ['./input-error.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputErrorComponent),
      multi: true,
    },
  ],
})
export class InputErrorComponent
  implements ControlValueAccessor, AfterViewInit, OnDestroy
{
  invalid: boolean | null | undefined;
  dirty: boolean | null | undefined;
  errors: ValidationErrors | null | undefined;

  private readonly onDestroy = new Subject<void>();

  constructor(private _injector: Injector, private cd: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    const formControl = this._injector.get(NgControl, null);
    formControl?.statusChanges
      ?.pipe(takeUntil(this.onDestroy))
      .subscribe(() => {
        this.invalid = formControl.invalid;
        this.errors = formControl.errors;
        this.dirty = formControl.dirty;
        this.cd.detectChanges();
      });
  }

  ngOnDestroy(): void {
    this.onDestroy.next();
    this.onDestroy.complete();
  }

  hasError(key: string): boolean {
    if (!this.errors) {
      return false;
    }
    return !!this.errors[key];
  }

  writeValue(): void {}

  registerOnChange(): void {}

  registerOnTouched(): void {}
}
