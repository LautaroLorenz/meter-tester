import { EssayTemplateStep } from '../../../models/business/database/essay-template-step.model';
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

@Component({
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export abstract class StepBuildFormComponent<
  T extends EssayTemplateStep,
  K extends FormGroup
> implements OnInit, OnDestroy
{
  @Input() essayTemplateStep!: T;

  @Output() formValidChange = new EventEmitter<boolean>();
  @Output() formValueChange = new EventEmitter<T>();

  readonly form: K;
  readonly onDestroy = new Subject<void>();
  readonly fb = inject(FormBuilder);

  constructor() {
    this.form = this.buildForm(this.fb);
  }

  ngOnInit(): void {
    this.patchInitValue();
    this.observeForm();
    this.onSuperInit();
  }

  ngOnDestroy(): void {
    this.onDestroy.next();
    this.onDestroy.complete();
    this.onSuperDestroy();
  }

  protected onSuperInit(): void {}

  protected onSuperDestroy(): void {}

  private patchInitValue(): void {
    this.form.patchValue(this.essayTemplateStep);
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
  }

  abstract buildForm(fb: FormBuilder): K;
}
