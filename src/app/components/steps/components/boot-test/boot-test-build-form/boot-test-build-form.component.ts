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
import { BootTestStep, BootTestStepForm } from './models/boot-test-step.model';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Steps } from '../../../../../models/business/enums/steps.model';
import { Subject, takeUntil, tap } from 'rxjs';

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
  @Output() formValueChange: EventEmitter<Partial<BootTestStep>>;

  readonly form: FormGroup<BootTestStepForm>;
  readonly stepId: Steps.BootTest;
  readonly onDestroy: Subject<void>;

  constructor(private fb: FormBuilder) {
    this.formValidChange = new EventEmitter<boolean>();
    this.formValueChange = new EventEmitter<Partial<BootTestStep>>();
    this.onDestroy = new Subject<void>();
    this.stepId = Steps.BootTest;
    this.form = this.buildForm();
  }

  ngOnInit(): void {  
    this.form.patchValue(this.essayTemplateStep);
    this.observeForm();
  }

  ngOnDestroy(): void {
    this.onDestroy.next();
    this.onDestroy.complete();
  }

  buildForm(): FormGroup<BootTestStepForm> {
    return this.fb.nonNullable.group({
      id: undefined,
      name: undefined,
      order: undefined,
      essay_template_id: undefined,
      step_id: this.stepId,
      form_control_raw: undefined,
      foreign: undefined,
    }) as FormGroup<BootTestStepForm>;
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
        tap((value) => this.formValueChange.emit(value))
      )
      .subscribe();
  }
}
