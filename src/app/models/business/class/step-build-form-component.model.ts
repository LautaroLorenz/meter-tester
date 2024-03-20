import { EssayTemplateStep } from '../database/essay-template-step.model';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject, takeUntil, tap } from 'rxjs';
import { AbstractFormGroup } from '../../core/abstract-form-group.model';

@Component({
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export abstract class StepBuildFormComponent<T extends EssayTemplateStep>
  implements OnInit, OnDestroy
{
  @Input() essayTemplateStep!: T;
  @Input() isVerification!: boolean;

  @Output() formValidChange = new EventEmitter<boolean>();
  @Output() formValueChange = new EventEmitter<T>();

  form!: FormGroup;
  readonly onDestroy = new Subject<void>();
  readonly fb = inject(FormBuilder);

  ngOnInit(): void {
    if (this.isVerification) {
      this.form = this.buildVerificationForm(this.fb);
    } else {
      this.form = this.buildForm(this.fb);
    }
    this.patchInitValue();
    this.observeForm();
    this.observeTables();
    this.requestToolsTables();
    this.afterSuperInit();
  }

  ngOnDestroy(): void {
    this.onDestroy.next();
    this.onDestroy.complete();
    this.afterSuperDestroy();
  }

  protected afterSuperInit(): void {}

  protected afterSuperDestroy(): void {}

  protected afterSuperPatchInitValue(): void {}

  protected afterSuperObserveForm(): void {}

  protected observeTables(): void {}

  protected requestToolsTables(): void {}

  private patchInitValue(): void {
    this.form.patchValue(this.essayTemplateStep);
    this.afterSuperPatchInitValue();
  }

  private observeForm(): void {
    this.form.statusChanges
      .pipe(
        takeUntil(this.onDestroy),
        tap((valid) => this.formValidChange.emit(valid === 'VALID'))
      )
      .subscribe();

    this.form.valueChanges
      .pipe(
        takeUntil(this.onDestroy),
        tap(() => this.formValueChange.emit(this.form.getRawValue() as T))
      )
      .subscribe();

    if (this.isVerification) {
      // para poder "verificar", sin cambiar ningún valor, siempre y cuando el form sea válido
      this.form.updateValueAndValidity();
    }
    this.afterSuperObserveForm();
  }

  abstract buildForm(fb: FormBuilder): AbstractFormGroup<T>;

  abstract buildVerificationForm(fb: FormBuilder): AbstractFormGroup<T>;
}
