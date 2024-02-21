import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { StepBuildForm } from '../../../models/step-build-form.model';
import {
  BootTestStep,
  BootTestStepFormGroup,
} from './models/boot-test-step.model';
import { FormBuilder } from '@angular/forms';
import { Subject, takeUntil, tap } from 'rxjs';
import { MeterConstants } from '../../../../../models/business/constants/meter-constant.model';

@Component({
  selector: 'app-boot-test-build-form',
  templateUrl: './boot-test-build-form.component.html',
  styleUrls: ['./boot-test-build-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BootTestBuildFormComponent
  implements StepBuildForm<BootTestStep>, OnInit, OnDestroy
{
  @Input() essayTemplateStep!: BootTestStep;

  @Output() formValidChange: EventEmitter<boolean>;
  @Output() formValueChange: EventEmitter<BootTestStep>;

  readonly form: BootTestStepFormGroup;
  readonly onDestroy: Subject<void>;
  readonly MeterConstants = MeterConstants;

  constructor(private fb: FormBuilder) {
    this.formValidChange = new EventEmitter<boolean>();
    this.formValueChange = new EventEmitter<BootTestStep>();
    this.onDestroy = new Subject<void>();
    this.form = this.buildForm();
  }

  ngOnInit(): void {
    this.patchInitValue();
    this.observeForm();
  }

  ngOnDestroy(): void {
    this.onDestroy.next();
    this.onDestroy.complete();
  }

  buildForm(): BootTestStepFormGroup {
    return this.fb.nonNullable.group({
      id: undefined,
      name: undefined,
      order: undefined,
      essay_template_id: undefined,
      step_id: undefined,
      form_control_raw: this.fb.nonNullable.group({
        meterConstant: undefined,
        phaseL1: this.fb.nonNullable.group({
          voltage: undefined,
          current: undefined,
          anglePhi: undefined,
        }),
        phaseL2: this.fb.nonNullable.group({
          voltage: undefined,
          current: undefined,
          anglePhi: undefined,
        }),
        phaseL3: this.fb.nonNullable.group({
          voltage: undefined,
          current: undefined,
          anglePhi: undefined,
        }),
      }),
      foreign: undefined,
    }) as BootTestStepFormGroup;
  }

  patchInitValue(): void {
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
        tap(() => this.formValueChange.emit(this.form.getRawValue()))
      )
      .subscribe();
  }
}
