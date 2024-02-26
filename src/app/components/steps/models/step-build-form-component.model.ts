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
import { AbstractFormGroup } from '../../../models/core/abstract-form-group.model';

@Component({
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export abstract class StepBuildFormComponent<T extends EssayTemplateStep>
  implements OnInit, OnDestroy
{
  @Input() essayTemplateStep!: Partial<T>;

  @Output() formValidChange = new EventEmitter<boolean>();
  @Output() formValueChange = new EventEmitter<T>();

  readonly form: FormGroup;
  readonly onDestroy = new Subject<void>();
  readonly fb = inject(FormBuilder);

  constructor() {
    this.form = this.buildForm(this.fb);
  }

  ngOnInit(): void {
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

    this.afterSuperObserveForm();
  }

  abstract buildForm(fb: FormBuilder): AbstractFormGroup<T>;
}
